import React, { useState, useEffect } from 'react';
import { BentoCard } from '../components/BentoCard';
import { Flame, Medal, Trophy, Users } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { Skeleton } from '../components/Skeleton';

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'individuals' | 'spaces'>('individuals');
  const [timeframe, setTimeframe] = useState('Last 7 Days');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Users Rank (by streak)
            const { data: streaksData, error: streaksError } = await supabase
                .from('streaks')
                .select('current_streak, longest_streak, updated_at, profiles(twitter_handle, avatar_url, goals)')
                .order('current_streak', { ascending: false })
                .limit(50);
            
            if (streaksError) throw streaksError;
            
            const formattedUsers = streaksData?.map((d: any, i: number) => ({
                rank: i + 1,
                name: d.profiles?.twitter_handle || 'User',
                handle: `@${d.profiles?.twitter_handle || 'user'}`,
                score: d.current_streak * 10, // Deterministic score
                streak: d.current_streak,
                volume: d.longest_streak || 0, // Using Longest Streak as Volume
                avatar: d.profiles?.avatar_url
            })) || [];
            
            setUsers(formattedUsers);

            // Fetch Spaces Rank
            const { data: spacesData, error: spacesError } = await supabase
                 .from('spaces')
                 .select('*, members(count)') // Added members(count)
                 .eq('visibility', 'public')
                 .order('streak_count', { ascending: false })
                 .limit(50);

            if (spacesError) throw spacesError;
            
            const formattedSpaces = spacesData?.map((s: any, i: number) => ({
                rank: i + 1,
                name: s.name,
                handle: s.visibility === 'public' ? 'Public' : 'Private',
                score: s.streak_count * 10,
                streak: s.streak_count,
                volume: s.members?.[0]?.count || 0, // Real Member Count
                members: s.members?.[0]?.count || 0
            })) || [];
            
            setSpaces(formattedSpaces);

        } catch (e) {
            console.error("Leaderboard fetch error:", e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const currentData = activeTab === 'individuals' ? users : spaces;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in-up">
      {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1 font-light">Top performers this week.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('individuals')}
            className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'individuals' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Individuals
          </button>
          <button 
             onClick={() => setActiveTab('spaces')}
             className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'spaces' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Spaces
          </button>
        </div>
      </div>

      <BentoCard className="p-0 overflow-hidden" noPadding>
        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Timeframe:</span>
                    <select 
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="bg-transparent text-sm font-medium text-gray-900 border-none focus:ring-0 cursor-pointer pl-0 py-0 outline-none"
                    >
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>All Time</option>
                    </select>
                 </div>
            </div>
            <div className="text-xs text-gray-400">
                Updates every 2 hours
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
              <div className="p-8 space-y-4">
                  {[1,2,3,4,5].map(i => <div key={i}><Skeleton className="h-16 w-full rounded-xl" /></div>)}
              </div>
          ) : (
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-medium text-gray-400 uppercase tracking-wider w-20">Rank</th>
                    <th className="px-8 py-5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {activeTab === 'individuals' ? 'User' : 'Space'}
                    </th>
                    <th className="px-8 py-5 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Score</th>
                    <th className="px-8 py-5 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Streak</th>
                    <th className="px-8 py-5 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Volume</th>
                </tr>
                </thead>
                <tbody>
                {currentData.length > 0 ? (
                    currentData.map((item, index) => {
                        const isTop3 = index < 3;
                        return (
                            <tr key={index} className={`group transition-colors ${
                                index === 0 ? 'bg-gradient-to-r from-gray-50/80 to-white' : 'hover:bg-gray-50'
                            }`}>
                            <td className="px-8 py-5">
                                <div className={`font-mono text-sm ${isTop3 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                {index === 0 && <Trophy className="w-4 h-4 text-gray-800 inline mr-2" />}
                                #{index + 1}
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                <div className={`w-9 h-9 rounded-full flex-shrink-0 border flex items-center justify-center ${
                                    isTop3 ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    {activeTab === 'individuals' ? (
                                        item.avatar ? (
                                            <img src={item.avatar} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-medium text-gray-500">{item.name.charAt(0)}</span>
                                        )
                                    ) : (
                                        <Users className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                                    <div className="text-xs text-gray-400">
                                        {activeTab === 'spaces' ? (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 uppercase tracking-wide border border-gray-200">
                                                {item.handle}
                                            </span>
                                        ) : (
                                            item.handle
                                        )}
                                    </div>
                                </div>
                                {isTop3 && <Medal className="w-3 h-3 text-gray-400 ml-1" />}
                                </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                    isTop3 ? 'bg-gray-900 text-white' : 'text-gray-900'
                                }`}>
                                    {Math.round(item.score)}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    {item.streak > 10 && <Flame className="w-3.5 h-3.5 text-gray-400 fill-gray-400" />}
                                    <span className="text-sm text-gray-700 font-medium">{item.streak}d</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-right text-sm text-gray-500 font-mono">
                                {(item.volume || 0).toLocaleString()}
                            </td>
                            </tr>
                        )
                    })
                ) : (
                     <tr>
                        <td colSpan={5} className="py-20 text-center text-gray-400 font-light">
                            No active {activeTab} found yet.
                        </td>
                     </tr>
                )}
                </tbody>
            </table>
          )}
        </div>
      </BentoCard>
    </div>
  );
};