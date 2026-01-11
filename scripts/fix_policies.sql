-- Enable deletion for space owners
CREATE POLICY "Owner can delete space" ON public.spaces FOR DELETE USING (auth.uid() = owner_id);
-- Also ensure members delete policy is robust (already exists: "Users can leave spaces" (auth.uid() = user_id))
-- Wait, "Users can leave spaces" only allows user to remove THEMSELVES.
-- Space Owner needs to remove ALL members when deleting the space.
-- Current policy: create policy "Users can leave spaces" on public.members for delete using (auth.uid() = user_id);
-- This prevents the owner from deleting OTHER members (required for cascade).

-- FIX: Allow space owner to delete ANY member in their space
CREATE POLICY "Owner can remove members" ON public.members FOR DELETE USING (
  exists (
    select 1 from public.spaces 
    where id = public.members.space_id 
    and owner_id = auth.uid()
  )
);
