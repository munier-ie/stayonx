import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { SpaceActivityEvent } from '../../components/SpaceActivityFeed';

export interface DashboardData {
  profile: any;
  activities: any[];
  spaces: any[];
  streaks: any;
  spaceActivity: SpaceActivityEvent[];
  loading: boolean;
  error: string | null;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    profile: null,
    activities: [],
    spaces: [],
    streaks: null,
    spaceActivity: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setData(d => ({ ...d, loading: false }));
          return;
        }

        const user = session.user;

        // 1. Ensure Profile Exists (Upsert if missing for MVP robustness)
        // In a real app, a trigger creates this, but we'll read first.
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
             // Profile doesn't exist, create it from Auth metadata
             const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{
                    id: user.id,
                    twitter_handle: user.user_metadata.user_name || user.user_metadata.name || 'user',
                    avatar_url: user.user_metadata.avatar_url,
                    goals: { reply: 5, tweet: 1, dm: 1 } // default
                }])
                .select()
                .single();
             
             if (createError) throw createError;
             profile = newProfile;
        } else if (profileError) {
             throw profileError;
        }

        // 2. Fetch Activities (Last 30 days)
        const { data: activities, error: actError } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30);

        if (actError) throw actError;

        // 3. Fetch Spaces (via members table)
        const { data: members, error: memError } = await supabase
          .from('members')
          .select('space_id, spaces(*)')
          .eq('user_id', user.id);
        
        if (memError) throw memError;
        const spaces = members?.map((m: any) => m.spaces) || [];

        // 4. Fetch Streaks
        const { data: streaks, error: streakError } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // It's okay if streaks missing initially

        // 5. Fetch Space Activity (for joined spaces)
        let spaceActivity: SpaceActivityEvent[] = [];
        
        if (spaces.length > 0) {
          const spaceIds = spaces.map((s: any) => s.id);
          
          const { data: activityData, error: activityError } = await supabase
            .from('space_activity')
            .select('*, profiles(twitter_handle, avatar_url)')
            .in('space_id', spaceIds)
            .order('created_at', { ascending: false })
            .limit(20);
          
          if (!activityError && activityData) {
            spaceActivity = activityData as SpaceActivityEvent[];
          }
        }
        
        setData({
          profile,
          activities: activities || [],
          spaces,
          streaks: streaks || { current_streak: 0, longest_streak: 0 },
          spaceActivity,
          loading: false,
          error: null
        });

      } catch (e: any) {
        // console.error('Error fetching dashboard data:', e);
        toast.error(e.message || 'Failed to refresh dashboard');
        setData(d => ({ ...d, loading: false, error: e.message }));
      }
    }

    fetchData();
  }, []);

  return data;
}

