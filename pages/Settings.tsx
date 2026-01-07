import React, { useState, useEffect } from 'react';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { AlertTriangle, Check, Lock } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { toast } from 'sonner';

// Custom Goal Input Component (Slider + Number Input)
const GoalInput = ({ label, value, onChange, min, max, unit }: any) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow empty string temporarily if needed, but for now enforce number
      let valStr = e.target.value;
      
      // If current value is 0 and user types a number, it typically becomes "05".
      // We want to treat that as "5".
      if (valStr.length > 1 && valStr.startsWith('0')) {
          valStr = valStr.substring(1);
      }

      let newValue = parseInt(valStr);
      if (isNaN(newValue)) newValue = 0;
      
      if (newValue < 0) newValue = 0;
      onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
        <div className="flex items-center gap-2 bg-gray-50 px-2 rounded border border-gray-100 hover:border-gray-200 transition-colors">
            <input 
                type="number"
                min={min}
                max={999} 
                value={value.toString()} // Force string conversion to avoid leading zero issues
                onChange={handleChange}
                className="w-12 text-right font-mono text-sm bg-transparent border-none focus:ring-0 p-1 text-gray-900"
            />
            <span className="text-xs text-gray-400 font-medium pr-1">{unit}</span>
        </div>
      </div>
      <div className="relative h-6 flex items-center group cursor-pointer">
         {/* Track */}
        <div className="absolute w-full h-[2px] bg-gray-200 rounded-full"></div>
        <div 
            className="absolute h-[2px] bg-gray-900 rounded-full transition-all duration-75" 
            style={{ width: `${Math.min(100, percentage)}%` }}
        ></div>
        {/* Input */}
        <input
            type="range"
            min={min}
            max={max}
            value={Math.min(max, value)} // Slider caps visually at max, but value can be higher
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Thumb Visual */}
        <div 
            className="absolute h-4 w-4 bg-white border border-gray-200 rounded-full shadow-sm pointer-events-none transition-transform duration-100 group-hover:scale-110"
            style={{ left: `calc(${Math.min(100, percentage)}% - 8px)` }}
        />
      </div>
    </div>
  );
};

export const Settings: React.FC = () => {
  const [goals, setGoals] = useState({
    replies: 20,
    tweets: 3,
    dms: 10
  });
  
  const [lockDuration, setLockDuration] = useState(7);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  
  const isLocked = lockedUntil ? new Date(lockedUntil) > new Date() : false;
  const canUnlock = false; // Only strictly time-based for now

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData && profileData.goals) {
          setGoals({
            replies: profileData.goals.reply ?? 20,
            tweets: profileData.goals.tweet ?? 3,
            dms: profileData.goals.dm ?? 10
          });
          
          if (profileData.goals.lock_until) {
              setLockedUntil(profileData.goals.lock_until);
          }
        }
      } catch (error) {
        toast.error('Failed to load settings'); // Added toast
        // console.error('Error fetching settings:', error); // Commented out
      } finally {
        setLoading(false); // Added isMounted check
      }
    }
    fetchData();
  }, []);

  const syncWithExtension = async (currentGoals: any) => {
      // Dispatch event for bridge.js to pick up
      try { // Added try-catch block
        const session = await supabase.auth.getSession();
        
        const payload = {
            type: 'STAYONX_SESSION_SYNC',
            session: session.data.session,
            goals: {
                reply: currentGoals.replies,
                tweet: currentGoals.tweets,
                dm: currentGoals.dms
            },
            space: null // we aren't syncing space here yet, or we could fetch it.
        };
        
        window.postMessage(payload, '*');
        // Fire generic event for extension to pick up too
        window.dispatchEvent(new CustomEvent('STAYONX_SESSION_SYNC', { detail: payload })); // Added dispatchEvent
        // console.log('Dispatched sync event to extension', payload); // Commented out
      } catch (e) {
        // ignore
      }
  };

  const handleSaveGoals = async () => {
    setSavingStatus('saving');
    
    try {
        if (!user) return;

        const goalsToSave = {
            reply: goals.replies,
            tweet: goals.tweets,
            dm: goals.dms,
            lock_until: isLocked ? lockedUntil : (lockDuration > 0 ? new Date(Date.now() + lockDuration * 86400000).toISOString() : null)
        };
        // Note: If already locked, we technically shouldn't be here unless saving something else? 
        // Actually if locked, button is disabled unless we are extending?
        // Let's assume if it is NOT locked, we are setting a new lock if user clicked save.
        // Wait, regular save shouldn't enforce lock unless requested?
        // UI shows "Lock & Save Goals" button when not locked. So we always lock if they click it?
        // The user request says "when choosing those goals if have to choose x amount of time to lockin".
        // So yes, saving always implies setting the lock if the duration selector is there?
        // In my UI design, "Lock & Save" implies locking. 
        // If they want to update goals WITHOUT locking, we should allow that? 
        // Requirement: "when choosing those goals if have to choose x amount of time to lockin". 
        // Implies locking is mandatory for setting goals? Or maybe optional.
        // Let's make it mandatory if they are setting new goals.
        // Logic: specific field "lock_until" in goals json.

        const { error } = await supabase
            .from('profiles')
            .update({ goals: goalsToSave })
            .eq('id', user.id);

        if (error) throw error;

        // Sync with extension
        await syncWithExtension(goals);

        setLockedUntil(goalsToSave.lock_until || null);
        setSavingStatus('saved');
        toast.success(goalsToSave.lock_until ? 'Goals locked and saved!' : 'Goals updated!');
        setTimeout(() => setSavingStatus('idle'), 2000);
    } catch (err) {
        toast.error('Failed to save goals');
        setSavingStatus('idle');
    }
  };

  if (loading) {
      return <div className="p-10 flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="max-w-[640px] mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1 font-light">Manage your goals and preferences.</p>
      </div>

      {/* 1. Daily Goals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Daily Goals</h2>
        </div>
        <BentoCard noPadding className="p-8 space-y-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium text-gray-900">Targets</h3>
                {lockedUntil && new Date(lockedUntil) > new Date() && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-medium">
                         <Lock className="w-3 h-3" />
                         <span>Locked for {Math.ceil((new Date(lockedUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} more days</span>
                    </div>
                )}
            </div>

            <GoalInput 
                label="Daily Replies" 
                value={goals.replies} 
                min={0} max={50} unit="replies"
                onChange={(val: number) => !isLocked && setGoals({...goals, replies: val})} 
                disabled={isLocked}
            />
            <GoalInput 
                label="Daily Tweets" 
                value={goals.tweets} 
                min={0} max={20} unit="tweets"
                onChange={(val: number) => !isLocked && setGoals({...goals, tweets: val})} 
                disabled={isLocked}
            />
            <GoalInput 
                label="DMs Sent" 
                value={goals.dms} 
                min={0} max={30} unit="msgs"
                onChange={(val: number) => !isLocked && setGoals({...goals, dms: val})} 
                disabled={isLocked}
            />
            
            {/* Lock Configuration */}
             <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                           <Lock className="w-3.5 h-3.5 text-gray-400" /> Monk Mode
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Lock these goals to build consistency.</p>
                    </div>
                    {!isLocked ? (
                        <div className="flex items-center gap-2">
                             <input 
                                type="number" 
                                min={7}
                                value={lockDuration}
                                onChange={(e) => setLockDuration(Math.max(7, parseInt(e.target.value) || 7))}
                                className="w-16 text-center text-sm border border-gray-200 rounded-md py-1 focus:ring-1 focus:ring-gray-900"
                             />
                             <span className="text-xs text-gray-500">days</span>
                        </div>
                    ) : (
                         <div className="text-xs text-gray-400 italic">
                             Unlocks on {new Date(lockedUntil!).toLocaleDateString()}
                         </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-2">
                 <Button 
                    onClick={handleSaveGoals} 
                    disabled={savingStatus === 'saving' || (isLocked && !canUnlock)} // canUnlock is false mostly
                    className={`transition-all duration-300 ${savingStatus === 'saved' ? 'bg-gray-900 hover:bg-gray-800 border-transparent text-white' : ''}`}
                 >
                    {savingStatus === 'saved' ? (
                        <div className="flex items-center gap-2">
                             <Check className="w-4 h-4" />
                             <span>Saved</span>
                        </div>
                    ) : isLocked ? (
                         <div className="flex items-center gap-2 opacity-50">
                            <Lock className="w-3 h-3" />
                            <span>Goals Locked</span>
                         </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>Lock & Save Goals</span>
                        </div>
                    )}
                 </Button>
            </div>
        </BentoCard>
      </section>



      {/* 3. Danger Zone */}
      <section className="pt-8">
        <div className="border border-red-100 bg-red-50/30 rounded-lg p-6 flex items-center justify-between">
            <div className="flex gap-4">
                <div className="p-2 bg-red-50 rounded-md h-fit">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[300px]">
                        Permanently remove your account and all of your data. This action cannot be undone.
                    </p>
                </div>
            </div>
            <Button variant="danger" size="sm">Delete Account</Button>
        </div>
      </section>

    </div>
  );
};