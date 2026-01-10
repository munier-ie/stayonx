import React, { useState, useEffect } from 'react';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { Users, Lock, Unlock, TrendingUp, Plus, Search, XCircle, ArrowLeft, LogOut, Check, X, Copy, Crown, MessageSquare, PenTool, Send, Loader2, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { toast } from 'sonner';

// Types matching User's Code
interface Member {
  id: string;
  name: string;
  handle: string;
  role: 'admin' | 'creator' | 'member';
  streak: number;
  progress: { tweets: number; replies: number; dms: number };
}

interface Space {
  id: number | string;
  name: string;
  category: string;
  memberCount: number;
  avgOutput: number;
  streak: number;
  isPrivate: boolean;
  isJoined: boolean;
  goals: { tweets: number; replies: number; dms: number; lock_duration?: number };
  creatorId?: string;
  members?: Member[];
  visibility?: string; // DB field helper
  original_id?: string; // DB UUID helper
  lockDuration?: number;
  joinedAt?: string;
}

const categories = ['All', 'Creators', 'Business', 'Writing', 'Dev', 'Health', 'Design'];

export const Spaces: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'my_spaces'>('browse');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Views
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | string | null>(null);
  
  // Modal State
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [spaceToQuit, setSpaceToQuit] = useState<Space | null>(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);

  // Invite Code State
  const [generatingCode, setGeneratingCode] = useState(false);
  
  // Join Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [spaceToJoin, setSpaceToJoin] = useState<Space | null>(null);

  // Form State
  const [newSpaceName, setNewSpaceName] = useState('');
  const [lockDuration, setLockDuration] = useState(7);
  const [isPrivate, setIsPrivate] = useState(false);
  const [goalConfig, setGoalConfig] = useState({
      tweets: { enabled: true, value: 1 },
      replies: { enabled: true, value: 10 },
      dms: { enabled: false, value: 5 },
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- DB INTEGRATION (Added) ---

  const fetchData = async () => {
      setLoading(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          setCurrentUser(user);

          // Get All Public Spaces
          const { data: dbSpaces, error } = await supabase
              .from('spaces')
              .select('*, members(count)')
              .order('streak_count', { ascending: false });

          if (error) throw error;

          // Get My Memberships (with created_at for lock check)
          let mySpaceIds: string[] = [];
          
          let myMembershipsMap: {[key: string]: string} = {};

          if (user) {
              const { data: memberships } = await supabase
                  .from('members')
                  .select('space_id, created_at')
                  .eq('user_id', user.id);
                  
              memberships?.forEach(m => {
                  myMembershipsMap[m.space_id] = m.created_at;
                  mySpaceIds.push(m.space_id);
              });
          }

          // Transform DB spaces to UI Space interface
          const formattedSpaces: Space[] = dbSpaces?.map((s: any) => ({
              id: s.id, // Keep UUID
              name: s.name,
              category: 'Creators', // Defaulting as DB lacks this
              memberCount: s.members?.[0]?.count || 0,
              avgOutput: 0,
              streak: s.streak_count,
              isPrivate: s.visibility === 'private',
              isJoined: mySpaceIds.includes(s.id),
              goals: { 
                  tweets: s.goals?.tweet || 0, 
                  replies: s.goals?.reply || 0, 
                  dms: s.goals?.dm || 0,
                  lock_duration: s.goals?.lock_duration
              },
              lockDuration: s.goals?.lock_duration || 0,
              joinedAt: myMembershipsMap[s.id],
              creatorId: s.owner_id
          })) || [];

          setSpaces(formattedSpaces);

      } catch (e) {
          console.error(e);
          toast.error("Failed to load spaces");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, []);
  
  const loadMemberDetails = async (spaceId: string) => {
      // Fetch detailed members for Detail View
      const { data: members, error } = await supabase
        .from('members')
        .select(`
            user_id,
            profiles (id, twitter_handle, avatar_url)
        `)
        .eq('space_id', spaceId);

      // Fetch streaks for progress
      const { data: streaks } = await supabase
          .from('streaks')
          .select('user_id, current_streak')
          .eq('space_id', spaceId);
      
      // Fetch Daily Logs for Real Progress
      // Extension writes to 'activities' table, so we must read from there.
      const d = new Date();
      const today = d.toLocaleDateString('en-CA'); // YYYY-MM-DD (matches extension's local date logic)
      
      const userIds = members?.map((m: any) => m.user_id) || [];
      
      let logsMap: any = {};
      
      if (userIds.length > 0) {
          const { data: logs } = await supabase
            .from('activities')
            .select('user_id, tweet_count, reply_count, dm_count')
            .eq('date', today)
            .in('user_id', userIds);
          
          logs?.forEach((l: any) => {
              logsMap[l.user_id] = {
                  tweets: l.tweet_count || 0,
                  replies: l.reply_count || 0,
                  dms: l.dm_count || 0
              };
          });
      }
      
      const streakMap: any = {};
      streaks?.forEach((s: any) => streakMap[s.user_id] = s.current_streak);

      if (members) {
          const detailedMembers: Member[] = members.map((m: any) => {
               const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
               const stats = logsMap[m.user_id] || {};
               return {
                   id: p?.id,
                   name: p?.twitter_handle || 'User',
                   handle: `@${p?.twitter_handle || 'user'}`,
                   role: 'member', // Simplified
                   streak: streakMap[m.user_id] || 0,
                   progress: { 
                       tweets: stats.tweets || 0, 
                       replies: stats.replies || 0, 
                       dms: stats.dms || 0 
                   }
               };
          });
          
          setSpaces(prev => prev.map(s => s.id === spaceId ? { ...s, members: detailedMembers } : s));
      }
  };

  const joinedSpace = spaces.find(s => s.isJoined);

  // --- Handlers ---

  const handleCreateSpace = () => {
     if (joinedSpace) {
        alert("You are already in a space. You must leave your current space before creating a new one.");
        return;
    }
    setViewMode('create');
  };

  const submitCreateSpace = async () => {
    if (!newSpaceName) return;
    
    // Constraint: Leave existing space first
    if (joinedSpace) {
        alert("You must leave your current space before creating a new one.");
        return;
    }

    setSubmitting(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) throw new Error("Not authenticated");

        const dbGoals = {
            tweet: goalConfig.tweets.enabled ? goalConfig.tweets.value : 0,
            reply: goalConfig.replies.enabled ? goalConfig.replies.value : 0,
            dm: goalConfig.dms.enabled ? goalConfig.dms.value : 0,
            lock_duration: lockDuration
        };

        const { data: newSpace, error } = await supabase.from('spaces').insert({
            name: newSpaceName,
            visibility: isPrivate ? 'private' : 'public',
            owner_id: user.id,
            goals: dbGoals,
            streak_count: 0
        }).select().single();

        if (error) throw error;

        // Auto Join
        await supabase.from('members').insert({ space_id: newSpace.id, user_id: user.id });

        // Log space creation activity
        await supabase.from('space_activity').insert({
            space_id: newSpace.id,
            user_id: user.id,
            event_type: 'space_created',
            event_data: { space_name: newSpaceName }
        });

        toast.success("Space Created");
        await fetchData(); // Refresh list
        
        // Setup local "created" state to jump to detail
        // We need to wait for fetchData to populate spaces first, but for responsiveness we can manually inject if needed.
        // For simplicity, just refetch and find.
        
        // Hack: Refetch might take a sec, let's manually update valid local state
        // Actually simplest is wait for refetch.
        
        // Set view
        setViewMode('detail');
        setSelectedSpaceId(newSpace.id);
        setActiveTab('my_spaces');

        // Trigger Extension Sync
        window.dispatchEvent(new Event('STAYONX_REFRESH_SYNC'));

    } catch (e: any) {
        toast.error(e.message);
    } finally {
        setSubmitting(false);
    }
  };

  const handleViewSpace = (space: Space) => {
    setSelectedSpaceId(space.id);
    loadMemberDetails(space.id.toString());
    setViewMode('detail');
  };

  const handleJoinSpaceInit = (space: Space) => {
      if (joinedSpace) {
        alert("You can only join one space at a time. Please leave your current space first.");
        return;
      }
      
      if (space.lockDuration && space.lockDuration > 0) {
          setSpaceToJoin(space);
          setShowJoinModal(true);
      } else {
          handleJoinSpace(space.id);
      }
  }

  const handleJoinSpace = async (spaceId: number | string) => {
    // Constraint: Single Space
    if (joinedSpace) {
        alert("You can only join one space at a time. Please leave your current space first.");
        return;
    }
    
    setSubmitting(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        const { error } = await supabase.from('members').insert({ space_id: spaceId, user_id: user.id });
        if(error) throw error;

        // Log join activity
        await supabase.from('space_activity').insert({
            space_id: spaceId,
            user_id: user.id,
            event_type: 'member_joined',
            event_data: {}
        });

        toast.success("Joined!");
        
        // Update local state
        setSpaces(spaces.map(s => s.id === spaceId ? { ...s, isJoined: true, joinedAt: new Date().toISOString() } : s));
        setSelectedSpaceId(spaceId);
        loadMemberDetails(spaceId.toString());
        setShowJoinModal(false);
        setSpaceToJoin(null);
        setViewMode('detail');
        setActiveTab('my_spaces');
        
        // Trigger Extension Sync
        window.dispatchEvent(new Event('STAYONX_REFRESH_SYNC'));
    } catch (e) {
        toast.error("Failed to join");
    } finally {
        setSubmitting(false);
    }
  };

  const openQuitModal = (space: Space) => {
      setSpaceToQuit(space);
      // Check lock duration
      if (space.lockDuration && space.lockDuration > 0 && space.joinedAt) {
          const joinedDate = new Date(space.joinedAt);
          const unlockDate = new Date(joinedDate.getTime() + space.lockDuration * 86400000);
          
          if (new Date() < unlockDate) {
               toast.error(`You committed to this space until ${unlockDate.toLocaleDateString()}`);
               return;
          }
      }
      setShowQuitModal(true);
  }

  const openDeleteModal = (space: Space) => {
      setSpaceToDelete(space);
      setShowDeleteModal(true);
  }

  // Generate 12-14 digit numeric invite code
  const generateInviteCode = (): string => {
      const length = 12 + Math.floor(Math.random() * 3); // 12, 13, or 14 digits
      let code = '';
      for (let i = 0; i < length; i++) {
          code += Math.floor(Math.random() * 10).toString();
      }
      return code;
  };

  const handleCopyInviteCode = async (space: Space) => {
      if (generatingCode) return;
      
      setGeneratingCode(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Generate new code
          const code = generateInviteCode();

          // Save to database
          const { error } = await supabase.from('space_invites').insert({
              space_id: space.id,
              code: code,
              created_by: user.id,
          });

          if (error) throw error;

          // Copy to clipboard
          await navigator.clipboard.writeText(code);
          toast.success(`Invite code copied: ${code}`);
      } catch (e) {
          console.error(e);
          toast.error("Failed to generate invite code");
      } finally {
          setGeneratingCode(false);
      }
  };

  const handleDeleteSpace = async () => {
     if (!spaceToDelete) return;
     
     setSubmitting(true);
     try {
         const { data: { user } } = await supabase.auth.getUser();
         if(!user) return;

         // Verify user is the creator
         if (spaceToDelete.creatorId !== user.id) {
             toast.error("Only the space creator can delete it");
             return;
         }

         const spaceId = spaceToDelete.id;

         // Delete all activities for users in this space
         const { data: memberIds } = await supabase
             .from('members')
             .select('user_id')
             .eq('space_id', spaceId);
         
         if (memberIds && memberIds.length > 0) {
             const userIds = memberIds.map(m => m.user_id);
             // Delete activities for these users (space-related)
             await supabase
                 .from('activities')
                 .delete()
                 .in('user_id', userIds);
         }

         // Delete all streaks for this space
         await supabase.from('streaks').delete().eq('space_id', spaceId);

         // Delete all members from this space
         await supabase.from('members').delete().eq('space_id', spaceId);

         // Delete the space itself
         const { error } = await supabase.from('spaces').delete().eq('id', spaceId);
         if (error) throw error;
         
         // Update local state - remove the space
         setSpaces(spaces.filter(s => s.id !== spaceId));
         setShowDeleteModal(false);
         setSpaceToDelete(null);
         setViewMode('list');
         setActiveTab('browse');
         setSelectedSpaceId(null);
         toast.success("Space deleted permanently");
         
         // Trigger Extension Sync
         window.dispatchEvent(new Event('STAYONX_REFRESH_SYNC'));
     } catch (e) {
         console.error(e);
         toast.error("Failed to delete space");
     } finally {
         setSubmitting(false);
     }
  };

  const handleQuitSpace = async () => {
     if (!spaceToQuit) return;
     
     setSubmitting(true);
     try {
         const { data: { user } } = await supabase.auth.getUser();
         if(!user) return; // should rely on auth context really

         // Log leave activity before removing membership
         await supabase.from('space_activity').insert({
             space_id: spaceToQuit.id,
             user_id: user.id,
             event_type: 'member_left',
             event_data: {}
         });

         await supabase.from('members').delete().eq('space_id', spaceToQuit.id).eq('user_id', user.id);
         
         setSpaces(spaces.map(s => s.id === spaceToQuit.id ? { ...s, isJoined: false } : s));
         setShowQuitModal(false);
         setSpaceToQuit(null);
         setViewMode('list');
         setActiveTab('browse');
         setSelectedSpaceId(null);
         toast.success("Left space");
         
         // Trigger Extension Sync
         window.dispatchEvent(new Event('STAYONX_REFRESH_SYNC'));
     } catch (e) {
         toast.error("Failed to leave");
     } finally {
         setSubmitting(false);
     }
  };

  // --- Filter Logic ---
  const filteredSpaces = spaces.filter((space) => {
    if (activeTab === 'my_spaces') {
        if (!space.isJoined) return false;
    } else {
        if (space.isJoined) return false;
    }

    const matchesCategory = selectedCategory === 'All' ? true : space.category === selectedCategory;
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          space.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // --- Sub-Components ---

  const GoalToggle = ({ 
      label, 
      icon: Icon, 
      config, 
      type 
  }: { label: string, icon: any, config: any, type: 'tweets'|'replies'|'dms' }) => {
      const state = config[type];
      return (
          <div className={`p-4 rounded-xl border transition-all duration-200 ${state.enabled ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white opacity-60 hover:opacity-100'}`}>
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${state.enabled ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                        <Icon className="w-4 h-4 text-gray-900" />
                      </div>
                      <span className="font-medium text-sm text-gray-900">{label}</span>
                  </div>
                  <div 
                    onClick={() => setGoalConfig({ ...config, [type]: { ...state, enabled: !state.enabled } })}
                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${state.enabled ? 'bg-gray-900' : 'bg-gray-200'}`}
                  >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${state.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
              </div>
              
              {state.enabled && (
                  <div>
                      <input 
                        type="number" 
                        min="1"
                        value={state.value}
                        onChange={(e) => setGoalConfig({ ...config, [type]: { ...state, value: parseInt(e.target.value) || 0 } })}
                        className="w-full text-center text-2xl font-light bg-white border border-gray-200 rounded-md py-2 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      />
                      <div className="text-center text-[10px] text-gray-400 mt-2 uppercase tracking-wide font-medium">Daily Target</div>
                  </div>
              )}
          </div>
      )
  }

  // --- Views ---

  const SpaceDetail = () => {
      const space = spaces.find(s => s.id === selectedSpaceId);
      if (!space) return <div>Space not found</div>;

      const isCreator = space.creatorId === currentUser?.id;
      
      const displayMembers = space.members && space.members.length > 0 ? space.members : [
          // Fallback if loading not done or empty
      ];

      return (
          <div className="animate-fade-in-up space-y-6 pb-20">
              <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
              </div>

              {/* Header Card */}
              <BentoCard noPadding className="p-8 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${space.streak > 50 ? 'bg-gray-900' : 'bg-gray-200'}`} />
                  <div className="flex justify-between items-start">
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                              <h2 className="text-3xl font-light text-gray-900">{space.name}</h2>
                              {space.isPrivate ? <Lock className="w-4 h-4 text-gray-400" /> : <Unlock className="w-4 h-4 text-gray-400" />}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 uppercase tracking-wide border border-gray-200">
                                  {space.category}
                              </span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
                              {space.goals.tweets > 0 && <div className="flex items-center gap-1"><PenTool className="w-3 h-3" /> {space.goals.tweets}</div>}
                              {space.goals.replies > 0 && <div className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {space.goals.replies}</div>}
                              {space.goals.dms > 0 && <div className="flex items-center gap-1"><Send className="w-3 h-3" /> {space.goals.dms}</div>}
                              <span className="text-gray-300">|</span>
                              <span>Daily Goals</span>
                              {space.lockDuration && space.lockDuration > 0 && (
                                  <>
                                     <span className="text-gray-300">|</span>
                                     <div className="flex items-center gap-1 text-gray-900 font-medium">
                                        <Lock className="w-3 h-3" /> {space.lockDuration}d Lock
                                     </div>
                                  </>
                              )}
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          {space.isJoined && (
                               <Button variant="danger" size="sm" onClick={() => openQuitModal(space)}>
                                   Leave Space
                               </Button>
                          )}
                          {isCreator && (
                               <Button variant="danger" size="sm" onClick={() => openDeleteModal(space)} className="gap-1">
                                   <Trash2 className="w-3 h-3" /> Delete Space
                               </Button>
                          )}
                      </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8 mt-8 border-t border-gray-100 pt-8">
                       <div>
                           <div className="text-sm text-gray-500 mb-1">Members</div>
                           <div className="text-2xl font-light text-gray-900 flex items-center gap-2">
                               {space.memberCount}
                           </div>
                       </div>
                       <div>
                           <div className="text-sm text-gray-500 mb-1">Space Streak</div>
                           <div className="text-2xl font-light text-gray-900 flex items-center gap-2">
                               {space.streak} <TrendingUp className="w-5 h-5 text-green-500" />
                           </div>
                       </div>
                       <div>
                            <div className="text-sm text-gray-500 mb-1">Invite</div>
                            {space.isPrivate && isCreator ? (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2"
                                    onClick={() => handleCopyInviteCode(space)}
                                    disabled={generatingCode}
                                >
                                    {generatingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Copy className="w-3 h-3" /> Generate & Copy Code</>}
                                </Button>
                            ) : (
                                <div className="text-sm text-gray-400 italic mt-1">
                                    {space.isPrivate ? "Ask admin for code" : "Public Space"}
                                </div>
                            )}
                       </div>
                  </div>
                  
                  {/* Join Button (if not joined and not creator) */}
                  {!space.isJoined && !isCreator && (
                     <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                         <Button onClick={() => handleJoinSpaceInit(space)} className="px-8">
                             Join Space
                         </Button>
                     </div>
                  )}
              </BentoCard>

              {/* Members List */}
              <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Members Activity</h3>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                      {displayMembers.map((member: any, i: number) => (
                          <div key={i} className="p-4 border-b border-gray-100 last:border-0 flex items-center justify-between hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-4 min-w-0">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600 text-sm flex-shrink-0">
                                      {member.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-900 truncate">{member.name}</span>
                                          {member.role === 'creator' && (
                                              <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                          )}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                          <TrendingUp className="w-3 h-3" /> {member.streak}d streak
                                      </div>
                                  </div>
                              </div>

                              {/* Multi-Progress Bars (Right Aligned, Compact) */}
                              <div className="flex items-center gap-3">
                                  {space.goals.tweets > 0 && (
                                      <div className="flex flex-col items-end w-16">
                                           <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                                               <PenTool className="w-2.5 h-2.5" />
                                               <span>{member.progress?.tweets || 0}/{space.goals.tweets}</span>
                                           </div>
                                           <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                               <div className="h-full bg-gray-800 rounded-full" style={{ width: `${Math.min(100, ((member.progress?.tweets||0)/space.goals.tweets)*100)}%` }} />
                                           </div>
                                      </div>
                                  )}
                                  {space.goals.replies > 0 && (
                                      <div className="flex flex-col items-end w-16">
                                           <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                                               <MessageSquare className="w-2.5 h-2.5" />
                                               <span>{member.progress?.replies || 0}/{space.goals.replies}</span>
                                           </div>
                                           <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                               <div className="h-full bg-gray-800 rounded-full" style={{ width: `${Math.min(100, ((member.progress?.replies||0)/space.goals.replies)*100)}%` }} />
                                           </div>
                                      </div>
                                  )}
                                  {space.goals.dms > 0 && (
                                      <div className="flex flex-col items-end w-16">
                                           <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                                               <Send className="w-2.5 h-2.5" />
                                               <span>{member.progress?.dms || 0}/{space.goals.dms}</span>
                                           </div>
                                           <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                               <div className="h-full bg-gray-800 rounded-full" style={{ width: `${Math.min(100, ((member.progress?.dms||0)/space.goals.dms)*100)}%` }} />
                                           </div>
                                      </div>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const CreateSpace = () => {
      return (
          <div className="max-w-2xl mx-auto animate-fade-in-up pb-20">
              <div className="mb-8">
                  <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className="mb-4">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <h2 className="text-2xl font-light text-gray-900">Create a Space</h2>
                  <p className="text-sm text-gray-500 mt-1">Define your tribe's daily habits.</p>
              </div>

              <div className="space-y-8">
                  {/* Name Input */}
                  <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Space Name</label>
                      <input 
                          type="text" 
                          value={newSpaceName}
                          onChange={(e) => setNewSpaceName(e.target.value)}
                          placeholder="e.g. Ship 30 Cohort 4"
                          className="w-full bg-[#FAFAFA] border-none rounded-xl px-4 py-4 text-lg text-gray-900 focus:ring-1 focus:ring-gray-900 placeholder:text-gray-300"
                      />
                  </div>

                  {/* Goal Configuration */}
                  <div className="space-y-4">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Daily Goals (Optional)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <GoalToggle label="Tweets" icon={PenTool} config={goalConfig} type="tweets" />
                          <GoalToggle label="Replies" icon={MessageSquare} config={goalConfig} type="replies" />
                          <GoalToggle label="DMs" icon={Send} config={goalConfig} type="dms" />
                      </div>
                      <p className="text-xs text-gray-400">Members must complete all enabled goals to maintain the streak.</p>
                  </div>

                  {/* Lock Duration */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                       <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                           <Lock className="w-3 h-3" /> Commitment Duration (Minimum 7 Days)
                       </label>
                       <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-4">
                           <div className="p-2 bg-white rounded-md border border-gray-100 shadow-sm">
                               <Calendar className="w-5 h-5 text-gray-900" />
                           </div>
                           <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">Lock-in Period</p>
                                <p className="text-xs text-gray-500">Members cannot leave until they complete this duration.</p>
                           </div>
                           <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    min={7}
                                    value={lockDuration}
                                    onChange={(e) => setLockDuration(Math.max(7, parseInt(e.target.value)||7))}
                                    className="w-20 text-center text-lg font-medium border border-gray-200 rounded-lg py-1 focus:ring-1 focus:ring-gray-900"
                                />
                                <span className="text-sm text-gray-500 font-medium">days</span>
                           </div>
                       </div>
                  </div>

                  {/* Visibility */}
                  <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Visibility</label>
                      <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setIsPrivate(false)}
                            className={`p-6 rounded-xl border text-left transition-all relative overflow-hidden group ${!isPrivate ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                          >
                              <div className="flex items-center gap-2 font-medium text-gray-900 mb-2"><Unlock className="w-4 h-4" /> Public</div>
                              <p className="text-xs text-gray-500 leading-relaxed">Anyone can see and join this space from the Browse tab.</p>
                              {!isPrivate && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-900"></div>}
                          </button>
                          <button 
                             onClick={() => setIsPrivate(true)}
                             className={`p-6 rounded-xl border text-left transition-all relative overflow-hidden group ${isPrivate ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                          >
                              <div className="flex items-center gap-2 font-medium text-gray-900 mb-2"><Lock className="w-4 h-4" /> Private</div>
                              <p className="text-xs text-gray-500 leading-relaxed">Hidden from Browse. Users can only join via your invite code.</p>
                              {isPrivate && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-900"></div>}
                          </button>
                      </div>
                  </div>

                  <div className="pt-6">
                      <Button fullWidth size="lg" onClick={submitCreateSpace} disabled={submitting}>
                          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Space"}
                      </Button>
                  </div>
              </div>
          </div>
      );
  };

  // --- Main Render (Matching User's EXACT structure) ---
  
  return (
    <div className="relative">
      {/* Top Level Modal */}
      {showQuitModal && spaceToQuit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" 
                onClick={() => setShowQuitModal(false)}
              ></div>
              
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-appear border border-gray-100 transform scale-100">
                  <div className="flex items-center gap-3 mb-4 text-red-600">
                      <div className="p-2 bg-red-50 rounded-lg">
                          <LogOut className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Leave Space?</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      Are you sure you want to leave <strong>{spaceToQuit.name}</strong>? 
                      <br/><br/>
                      Your personal goals will become active again. You will lose your {spaceToQuit.streak}-day streak in this space.
                  </p>
                  <div className="flex gap-3 justify-end">
                      <Button variant="ghost" onClick={() => setShowQuitModal(false)}>Cancel</Button>
                      <Button variant="danger" onClick={handleQuitSpace} disabled={submitting}>Leave Space</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Delete Space Modal */}
      {showDeleteModal && spaceToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" 
                onClick={() => setShowDeleteModal(false)}
              ></div>
              
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-appear border border-gray-100 transform scale-100">
                  <div className="flex items-center gap-3 mb-4 text-red-600">
                      <div className="p-2 bg-red-50 rounded-lg">
                          <Trash2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Delete Space Forever?</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                      Are you sure you want to permanently delete <strong>{spaceToDelete.name}</strong>?
                  </p>
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-6">
                      <p className="text-sm text-red-700 font-medium">⚠️ This action cannot be undone!</p>
                      <ul className="text-xs text-red-600 mt-2 space-y-1">
                          <li>• All {spaceToDelete.memberCount} members will be removed</li>
                          <li>• All streaks and activity data will be deleted</li>
                          <li>• This space will be gone forever</li>
                      </ul>
                  </div>
                  <div className="flex gap-3 justify-end">
                      <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                      <Button variant="danger" onClick={handleDeleteSpace} disabled={submitting}>
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {viewMode === 'detail' && <SpaceDetail />}
      {viewMode === 'create' && <CreateSpace />}
      
      {viewMode === 'list' && (
        <div className="space-y-10 animate-fade-in-up">
           {/* Header */}
           <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">Spaces</h1>
              <p className="text-sm text-gray-500 mt-1 font-light">Find your accountability crew.</p>
            </div>
            {!joinedSpace && (
                 <Button className="flex items-center gap-2" onClick={handleCreateSpace}>
                    <Plus className="w-4 h-4" />
                    Create Space
                </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Navigation & Search Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-0">
                {/* Tabs */}
                <div className="flex items-center gap-8">
                    <button 
                        onClick={() => setActiveTab('browse')}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'browse' 
                            ? 'text-gray-900 border-gray-900' 
                            : 'text-gray-500 border-transparent hover:text-gray-900'
                        }`}
                    >
                        Browse Spaces
                    </button>
                    <button 
                        onClick={() => setActiveTab('my_spaces')}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'my_spaces' 
                            ? 'text-gray-900 border-gray-900' 
                            : 'text-gray-500 border-transparent hover:text-gray-900'
                        }`}
                    >
                        My Spaces {joinedSpace ? '(1)' : ''}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-2 md:mb-0 md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search spaces..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-all"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-gray-600"
                        >
                            <XCircle className="h-4 w-4 text-gray-300" />
                        </button>
                    )}
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {categories.map((cat) => (
                    <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap ${
                        selectedCategory === cat 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                        {cat}
                    </button>
                ))}
            </div>
          </div>

          {/* Grid */}
          {filteredSpaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                {filteredSpaces.map((space) => (
                    <BentoCard key={space.id} className="group cursor-pointer hover:border-gray-300 transition-all hover:shadow-card relative overflow-hidden">
                        {/* Status Indicator Line */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${space.streak > 50 ? 'bg-gray-900' : 'bg-transparent'}`} />

                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-white group-hover:border-gray-200 transition-colors">
                                <Users className="w-5 h-5 stroke-[1.5px]" />
                            </div>
                            {space.isPrivate ? <Lock className="w-3 h-3 text-gray-300" /> : <Unlock className="w-3 h-3 text-gray-300" />}
                        </div>
                        
                        <h3 className="font-semibold text-lg text-gray-900 tracking-tight">{space.name}</h3>
                        <div className="flex gap-2 mt-3 mb-8">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 uppercase tracking-wide border border-gray-200">
                                {space.category}
                            </span>
                            {space.isJoined && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700 uppercase tracking-wide border border-green-100">
                                    Joined
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5" title="Members">
                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-medium text-gray-700">{space.memberCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Current Streak">
                                        <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-medium text-gray-700">{space.streak}d</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    {space.goals.tweets > 0 && <span className="flex items-center gap-1"><PenTool className="w-3 h-3" /> {space.goals.tweets}</span>}
                                    {space.goals.replies > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {space.goals.replies}</span>}
                                    {space.goals.dms > 0 && <span className="flex items-center gap-1"><Send className="w-3 h-3" /> {space.goals.dms}</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {space.creatorId === currentUser?.id && (
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); openDeleteModal(space); }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Space"
                                     >
                                         <Trash2 className="w-4 h-4" />
                                     </button>
                                )}
                                {space.isJoined ? (
                                     <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                                        onClick={() => handleViewSpace(space)}
                                    >
                                        View
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                                        disabled={!!joinedSpace}
                                        title={joinedSpace ? "You must leave your current space first" : "Join Space"}
                                        onClick={() => handleJoinSpace(space.id)}
                                    >
                                        Join
                                    </Button>
                                )}
                            </div>
                        </div>
                    </BentoCard>
                ))}
              </div>
          ) : (
              <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No spaces found</h3>
                  <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                      {activeTab === 'my_spaces' ? "You haven't joined any spaces yet." : "We couldn't find any spaces matching your criteria."}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6"
                    onClick={() => {
                        if (activeTab === 'my_spaces') setActiveTab('browse');
                        else {
                            setSearchQuery('');
                            setSelectedCategory('All');
                        }
                    }}
                  >
                      {activeTab === 'my_spaces' ? "Browse Spaces" : "Clear Filters"}
                  </Button>
              </div>
          )}
        </div>
      )}
    </div>
  );
};