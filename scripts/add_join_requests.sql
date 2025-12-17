-- Create Space Requests table
CREATE TABLE IF NOT EXISTS public.space_requests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    unique(space_id, user_id) -- One active request per user per space
);

-- RLS
ALTER TABLE public.space_requests ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own requests
CREATE POLICY "Users can view own requests" ON public.space_requests
    FOR SELECT USING (auth.uid() = user_id);

-- 2. Space Owners can view requests for their spaces
CREATE POLICY "Owners can view requests" ON public.space_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.spaces 
            WHERE id = space_id AND owner_id = auth.uid()
        )
    );

-- 3. Users can insert (create) requests
CREATE POLICY "Users can create requests" ON public.space_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Owners can update status (Approve/Reject)
CREATE POLICY "Owners can update requests" ON public.space_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.spaces 
            WHERE id = space_id AND owner_id = auth.uid()
        )
    );

-- Function to handle Request Approval (Atomic)
CREATE OR REPLACE FUNCTION public.approve_join_request(request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    req_record public.space_requests%ROWTYPE;
BEGIN
    -- 1. Get Request
    SELECT * INTO req_record FROM public.space_requests WHERE id = request_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Request not found');
    END IF;

    -- 2. Verify Caller is Owner
    IF NOT EXISTS (SELECT 1 FROM public.spaces WHERE id = req_record.space_id AND owner_id = auth.uid()) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authorized');
    END IF;

    -- 3. Add to Members
    -- Check if already member
    IF EXISTS (SELECT 1 FROM public.members WHERE space_id = req_record.space_id AND user_id = req_record.user_id) THEN
         -- Just update status to approved, no insert needed
         UPDATE public.space_requests SET status = 'approved' WHERE id = request_id;
         RETURN jsonb_build_object('success', true, 'message', 'User already in space');
    END IF;

    INSERT INTO public.members (space_id, user_id)
    VALUES (req_record.space_id, req_record.user_id);

    -- 4. Update Request Status
    UPDATE public.space_requests SET status = 'approved' WHERE id = request_id;

    RETURN jsonb_build_object('success', true);
END;
$$;
