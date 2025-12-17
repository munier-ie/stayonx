import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useExtensionSync() {
  useEffect(() => {
    // Function to perform the sync
    const sync = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        let goals = { reply: 5, tweet: 1, dm: 1 }; // Default
        let space = null;

        if (session) {
            // 1. Get Personal Goals
            const { data: profile } = await supabase
                .from('profiles')
                .select('goals')
                .eq('id', session.user.id)
                .single();
            
            if (profile?.goals) goals = profile.goals;

            // 2. Get Active Space
            // We fetch the first joined space for now (MVP restriction: 1 space)
            const { data: members } = await supabase
                .from('members')
                .select('space_id, spaces(*)')
                .eq('user_id', session.user.id)
                .limit(1);
            
            if (members && members.length > 0 && members[0].spaces) {
                space = members[0].spaces;
            }
        }

        // 3. Send to Extension via Bridge
        window.postMessage({ 
          type: 'STAYONX_SESSION_SYNC', 
          session,
          goals,
          space
        }, '*');

        // logging for debug
        // console.log('[useExtensionSync] Synced:', { session: !!session, space: space?.name });

      } catch (e) {
        // console.error('[useExtensionSync] Sync failed', e);
      }
    };

    // Initial Sync
    sync();

    // Listen for refresh requests (e.g. from Spaces page actions)
    const handleRefresh = () => sync();
    window.addEventListener('STAYONX_REFRESH_SYNC', handleRefresh);
    
    // Also listen for auth changes to re-sync automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        sync();
    });

    return () => {
        window.removeEventListener('STAYONX_REFRESH_SYNC', handleRefresh);
        subscription.unsubscribe();
    };
  }, []);
}
