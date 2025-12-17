-- Create Space Invites table for One-Time Use Codes
CREATE TABLE IF NOT EXISTS public.space_invites (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
    code text NOT NULL,
    created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_used boolean DEFAULT false,
    used_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '48 hours') -- Codes expire in 48h by default
);

-- RLS
ALTER TABLE public.space_invites ENABLE ROW LEVEL SECURITY;

-- Creators can see invites they created
CREATE POLICY "Creators can view their own invites" ON public.space_invites
    FOR SELECT USING (auth.uid() = created_by);

-- Creators can insert invites for spaces they own
CREATE POLICY "Creators can create invites" ON public.space_invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.spaces 
            WHERE id = space_id AND owner_id = auth.uid()
        )
    );

-- Anyone (authenticated) can "consume" an invite if they know the code (Update)
-- We use a precise logic: User can update 'is_used' and 'used_by' IF code matches and is unused.
-- Actually, for security, usually we use a specific function/RPC to redeem code to prevent race conditions or peaking.
-- But for MVP, we can allow SELECT on 'code' if we treat code as a secret? No, RLS prevents select.
-- We need a function to 'join_by_code'.

CREATE OR REPLACE FUNCTION public.join_space_by_code(invite_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    invite_record public.space_invites%ROWTYPE;
    space_record public.spaces%ROWTYPE;
    target_space_id uuid;
BEGIN
    -- 1. Find valid invite
    SELECT * INTO invite_record 
    FROM public.space_invites 
    WHERE code = invite_code 
      AND is_used = false 
      AND (expires_at > now() OR expires_at IS NULL);

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired invite code');
    END IF;

    target_space_id := invite_record.space_id;

    -- 2. Check if user is already in A space? 
    -- Application logic should enforce "Single Space", but DB constraint?
    -- Step 61 in schema: unique(space_id, user_id). This allows multiple spaces.
    -- If we want strict single space, we should check `members` table for auth.uid().
    -- "members" schema: unique(space_id, user_id).
    
    IF EXISTS (SELECT 1 FROM public.members WHERE user_id = auth.uid()) THEN
         RETURN jsonb_build_object('success', false, 'message', 'You are already in a space. Leave it first.');
    END IF;

    -- 3. Add Member
    INSERT INTO public.members (space_id, user_id)
    VALUES (target_space_id, auth.uid());

    -- 4. Mark Invite Used
    UPDATE public.space_invites 
    SET is_used = true, used_by = auth.uid()
    WHERE id = invite_record.id;

    -- 5. Return success and space info
    SELECT * INTO space_record FROM public.spaces WHERE id = target_space_id;
    
    RETURN jsonb_build_object('success', true, 'space_id', target_space_id, 'space_name', space_record.name);
END;
$$;
