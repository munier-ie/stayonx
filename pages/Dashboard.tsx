import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase'; // Import Supabase client
import { useDashboardData } from '../src/hooks/useDashboardData';
import { 
  ResponsiveContainer, 
  ComposedChart,
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { 
  Flame, 
  Medal, 
  MessageSquare, 
  Send, 
  PenTool,
  Users
} from 'lucide-react';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { BadgeSection } from '../components/BadgeSection';
import { SpaceActivityFeed } from '../components/SpaceActivityFeed';

const MetricTile = ({ title, value, goal, icon: Icon }: { title: string, value: string, goal: string, icon: any }) => {
  const val = parseInt(value);
  const target = parseInt(goal);
  const percent = target === 0 ? 100 : Math.min(100, Math.max(0, (val / target) * 100));

  // Generate cumulative mock data for the sparkline based on the actual value
  const data = useMemo(() => {
    const points = [];
    const steps = 12; // number of points in sparkline
    
    // Create a smooth cumulative curve
    for (let i = 0; i <= steps; i++) {
        if (i === 0) {
             points.push({ val: 0 });
        } else if (i === steps) {
             points.push({ val: val });
        } else {
             // Use a ease-in-out like curve for natural accumulation look
             const progress = i / steps;
             const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
             // Add some randomness so it's not a perfect curve
             const randomVariance = (Math.random() - 0.5) * (val * 0.1);
             points.push({ val: Math.max(0, (val * ease) + randomVariance) });
        }
    }
    return points;
  }, [val]);

  // Circle Progress
  const radius = 9; // Reduced radius to ensure no clipping
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col h-full justify-between relative overflow-hidden group">
        {/* Sparkline Background */}
        <div className="absolute -right-2 -bottom-2 w-32 h-20 opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data}>
               <defs>
                 <filter id={`shadow-${title.replace(/\s+/g, '')}`} x="-50%" y="-50%" width="200%" height="200%">
                   <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
                 </filter>
               </defs>
               <YAxis domain={[0, Math.max(target, val) * 1.2]} hide />
               <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#111827"
                    strokeWidth={2}
                    fill="#111827"
                    fillOpacity={0.1}
                    isAnimationActive={true}
                    animationDuration={1500}
                    filter={`url(#shadow-${title.replace(/\s+/g, '')})`}
               />
             </AreaChart>
           </ResponsiveContainer>
        </div>

        {/* Added relative positioning to ensure z-index works and content sits above sparkline */}
        <div className="flex justify-between items-start z-10 relative">
          <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100 transition-colors group-hover:bg-white group-hover:border-gray-200 shadow-sm">
            <Icon className="w-3.5 h-3.5 text-gray-500 stroke-[1.5px]" />
          </div>
          
          {/* Progress Ring */}
          <div className="relative w-8 h-8 flex items-center justify-center" title={`${Math.round(percent)}%`}>
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                 {/* Track - Darkened slightly for better visibility */}
                 <circle
                     cx="12"
                     cy="12"
                     r={radius}
                     stroke="#E5E7EB"
                     strokeWidth="2.5"
                     fill="transparent"
                 />
                 {/* Indicator */}
                 <circle
                     cx="12"
                     cy="12"
                     r={radius}
                     stroke={percent >= 100 ? "#22c55e" : "#111827"} // Green if complete, Black otherwise
                     strokeWidth="2.5"
                     fill="transparent"
                     strokeDasharray={circumference}
                     strokeDashoffset={strokeDashoffset}
                     strokeLinecap="round"
                     className="transition-all duration-1000 ease-out"
                 />
             </svg>
          </div>
        </div>
        
        {/* Added relative positioning here as well */}
        <div className="mt-4 z-10 relative">
          <div className="flex items-baseline gap-1.5">
             <span className="text-2xl font-light text-gray-900 tracking-tight">{value}</span>
             <span className="text-xs text-gray-400 font-light font-mono">/ {goal}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
             <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{title}</span>
             {percent >= 100 && (
                 <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 uppercase tracking-wider animate-fade-in-up">
                     Met
                 </span>
             )}
          </div>
        </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { profile, activities, spaces, spaceActivity, loading } = useDashboardData();

  // Sync Session with Extension handled globally in Layout via useExtensionSync
  // Local sync removed to prevent conflicts and ensure one source of truth.

  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [badgesExpanded, setBadgesExpanded] = useState(false);

  const isJoinedSpace = spaces && spaces.length > 0;
  const currentSpaceName = isJoinedSpace ? spaces[0].name : "No Space";
  
  // Goals Logic
  const defaultGoals = { reply: 5, tweet: 1, dm: 1 };
  const userGoals = profile?.goals || defaultGoals;
  
  // Active Goals for displays (use space goals if joined, else personal)
  const activeGoals = (isJoinedSpace && spaces[0]?.goals) ? spaces[0].goals : userGoals;

  // Find Today's Activity
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayActivity = activities.find(a => a.date === todayStr) || { reply_count: 0, tweet_count: 0, dm_count: 0 };

  // Current Metrics vs Goals
  const metrics = {
      replies: { value: todayActivity.reply_count, goal: activeGoals.reply ?? 5 },
      tweets: { value: todayActivity.tweet_count, goal: activeGoals.tweet ?? 1 },
      dms: { value: todayActivity.dm_count, goal: activeGoals.dm ?? 1 }
  };

  // Generate Chart Data from real activities + fill gaps
  const activityData = (() => {
    const days = timeframe === '7d' ? 7 : 30;
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dStr = d.toLocaleDateString('en-CA');
        
        const act = activities.find(a => a.date === dStr) || { reply_count: 0, tweet_count: 0, dm_count: 0 };
        
        result.push({
            day: timeframe === '7d' 
                ? d.toLocaleDateString('en-US', { weekday: 'short' }) 
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            tweets: act.tweet_count,
            replies: act.reply_count,
            dms: act.dm_count
        });
    }
    return result;
  })();

  // Calculate Streak Dynamic Logic
  const currentStreak = useMemo(() => {
     if (!activities || activities.length === 0) return 0;
     
     // Helper to check if a day met goals
     const checkMet = (act: any) => {
        if (!act) return false;
        const rGoal = activeGoals.reply ?? 5;
        const tGoal = activeGoals.tweet ?? 1;
        const dGoal = activeGoals.dm ?? 1;
        
        // Handle 0 goals as auto-met
        const rMet = rGoal === 0 || (act.reply_count || 0) >= rGoal;
        const tMet = tGoal === 0 || (act.tweet_count || 0) >= tGoal;
        const dMet = dGoal === 0 || (act.dm_count || 0) >= dGoal;
        
        return rMet && tMet && dMet;
     };

     // 1. Check Today
     const todayMet = checkMet(todayActivity);
     
     // 2. Check Yesterday backwards
     let streak = todayMet ? 1 : 0;
     const todayDate = new Date();
     
     // Start checking from yesterday
     for (let i = 1; i < 365; i++) {
        const d = new Date();
        d.setDate(todayDate.getDate() - i);
        const dayStr = d.toLocaleDateString('en-CA');
        
        const act = activities.find(a => a.date === dayStr);
        if (act && checkMet(act)) {
            streak++;
        } else {
            // Streak broken
            break; 
        }
     }
     
     return streak;
  }, [activities, activeGoals, todayActivity]);

  if (loading) {
     return (
       <div className="space-y-6 pb-12">
          {/* Header Skeleton */}
          <div className="flex items-end justify-between">
             <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
             </div>
             <Skeleton className="h-10 w-48 rounded-lg" />
          </div>

          {/* Metrics Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col justify-between">
                   <Skeleton className="h-8 w-8 rounded-md" />
                   <div className="space-y-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-12" />
                   </div>
                </div>
             ))}
          </div>

          {/* Activity Chart Skeleton */}
          <div className="h-[300px] bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col">
             <div className="flex justify-between mb-8">
                <div className="space-y-2">
                   <Skeleton className="h-6 w-32" />
                   <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                   <Skeleton className="h-8 w-12" />
                   <Skeleton className="h-8 w-12" />
                </div>
             </div>
             <Skeleton className="flex-1 w-full rounded-lg" />
          </div>
       </div>
     );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="flex items-end justify-between">
        <div>
           <h1 className="text-3xl font-light text-gray-900 tracking-tight">Dashboard</h1>
           <div className="flex items-center gap-2 mt-1">
             <p className="text-sm text-gray-500 font-light">Your consistency pulse.</p>
             {isJoinedSpace && (
               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  <Users className="w-3 h-3" />
                  {currentSpaceName}
               </span>
             )}
           </div>
        </div>
        
        {/* Streak Banner (Connected) */}
        <div className="flex items-center gap-4 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 uppercase font-medium tracking-wider">Current Streak</span>
                <span className={`text-lg font-medium flex items-center gap-1 ${currentStreak > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                    {currentStreak} <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300 fill-gray-300'}`} />
                </span>
            </div>
            <div className="h-8 w-px bg-gray-100 mx-2"></div>
            <div className="flex gap-1">
                {/* Show last 7 days visual status (rightmost is today) */}
                 {[6,5,4,3,2,1,0].map(daysAgo => {
                     const d = new Date();
                     d.setDate(new Date().getDate() - daysAgo);
                     const dStr = d.toLocaleDateString('en-CA');
                     const act = activities.find(a => a.date === dStr);
                     
                     // Logic for met
                     const rGoal = activeGoals.reply ?? 5;
                     const tGoal = activeGoals.tweet ?? 1;
                     const dGoal = activeGoals.dm ?? 1;
                     
                     // Treat 0 goals as met
                     const rMet = rGoal === 0 || (act ? (act.reply_count || 0) >= rGoal : false);
                     const tMet = tGoal === 0 || (act ? (act.tweet_count || 0) >= tGoal : false);
                     const dMet = dGoal === 0 || (act ? (act.dm_count || 0) >= dGoal : false);
                     
                     const met = act && rMet && tMet && dMet;

                     const isToday = daysAgo === 0;

                      return (
                         <div 
                             key={daysAgo} 
                             title={`${dStr}: ${met ? 'Met' : 'Missed'}`}
                             className={`w-2 h-8 rounded-sm ${met ? 'bg-gray-900' : 'bg-gray-200'} ${isToday ? 'animate-pulse' : ''}`}
                             style={{ backgroundColor: met ? '#111827' : '#e5e7eb' }}
                         />
                     );
                 })}
            </div>
        </div>
      </div>

      {/* 2. Top Bento Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <BentoCard>
          <MetricTile 
            title="Replies" 
            value={metrics.replies.value.toString()} 
            goal={metrics.replies.goal.toString()} 
            icon={MessageSquare} 
          />
        </BentoCard>
        <BentoCard>
          <MetricTile 
            title="Tweets" 
            value={metrics.tweets.value.toString()} 
            goal={metrics.tweets.goal.toString()} 
            icon={PenTool} 
          />
        </BentoCard>
        <BentoCard>
          <MetricTile 
            title="DMs Sent" 
            value={metrics.dms.value.toString()} 
            goal={metrics.dms.goal.toString()} 
            icon={Send} 
          />
        </BentoCard>
      </div>

      {/* 3. Middle: Multi-line Activity Chart */}
      <BentoCard title="Activity Volume" subtitle={`Last ${timeframe === '7d' ? '7 days' : '30 days'} performance`} className="h-auto" action={
        <div className="flex gap-2">
            <button 
                onClick={() => setTimeframe('7d')}
                className={`text-xs font-medium px-3 py-1 rounded transition-colors ${timeframe === '7d' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
                7d
            </button>
            <button 
                onClick={() => setTimeframe('30d')}
                className={`text-xs font-medium px-3 py-1 rounded transition-colors ${timeframe === '30d' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
                30d
            </button>
        </div>
      }>
        <div className="h-[200px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <defs>
                 <linearGradient id="colorTweets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                 </linearGradient>
                 <linearGradient id="colorDms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D1D5DB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D1D5DB" stopOpacity={0}/>
                 </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 11 }} 
              />
              <Tooltip 
                cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px'
                }}
                itemStyle={{ fontSize: '12px', color: '#374151', padding: 0 }}
                labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}
              />
              
              {/* Tweets: Obsidian, Solid, Gradient Shadow to Bottom */}
              <Area 
                type="monotone" 
                dataKey="tweets" 
                stroke="#111827" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorTweets)" 
                activeDot={{ r: 5, fill: '#111827' }} 
                animationDuration={1000}
                dot={timeframe === '7d' ? { r: 3, fill: '#111827', strokeWidth: 0 } : false}
              />

              {/* DMs: Light Grey, Solid, Gradient Shadow to Bottom */}
              <Area 
                type="monotone" 
                dataKey="dms" 
                stroke="#D1D5DB" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorDms)" 
                activeDot={{ r: 4, fill: '#D1D5DB' }} 
                animationDuration={1000}
                dot={false}
              />

              {/* Replies: Steel, Dashed Line (No Fill/Shadow) to keep distinct */}
              <Line 
                type="monotone" 
                dataKey="replies" 
                stroke="#9CA3AF" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                dot={false}
                activeDot={{ r: 4, fill: '#9CA3AF' }} 
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 bg-[#111827] opacity-25 rounded-sm border border-[#111827]"></div> Tweets
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-0.5 bg-gray-400 border-t border-dashed border-gray-400"></div> Replies
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                 <div className="w-3 h-3 bg-[#D1D5DB] opacity-40 rounded-sm border border-[#D1D5DB]"></div> DMs
            </div>
        </div>
      </BentoCard>

      {/* 4. Bottom Grid: Streaks, Badges, Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left Column: Badges */}
        <div className="space-y-5">
            <BentoCard 
              title="Badges" 
              action={
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setBadgesExpanded(!badgesExpanded)}
                >
                  {badgesExpanded ? 'Collapse' : 'View All'}
                </Button>
              }
            >
                <BadgeSection userId={profile?.id} className="pt-2" expanded={badgesExpanded} />
            </BentoCard>
        </div>

        {/* Right Column: Team/Space Activity */}
        <BentoCard 
            title="Team Updates" 
            subtitle={isJoinedSpace ? `Space: ${currentSpaceName}` : "Join a space to see updates"}
            action={<Button variant="outline" size="sm">Space Details</Button>}
        >
             {isJoinedSpace ? (
               <SpaceActivityFeed 
                 activities={spaceActivity} 
                 loading={loading} 
                 className="pt-2" 
               />
             ) : (
               <div className="relative p-4">
                 <p className="text-sm text-gray-400">
                   Join a space to unlock team updates
                 </p>
               </div>
             )}
        </BentoCard>
      </div>

    </div>
  );
};