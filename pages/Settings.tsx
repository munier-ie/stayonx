import React, { useState, useEffect } from 'react';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { AlertTriangle, Check } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { toast } from 'sonner';

// Custom Goal Input Component (Slider + Number Input)
const GoalInput = ({ label, value, onChange, min, max, unit }: any) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = parseInt(e.target.value);
      if (isNaN(newValue)) newValue = 0;
      // Allow exceeding max via text input if desired, or clamp it. 
      // For now, let's clamp only min to 0
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
                value={value}
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
            dm: goals.dms
        };

        const { error } = await supabase
            .from('profiles')
            .update({ goals: goalsToSave })
            .eq('id', user.id);

        if (error) throw error;

        // Sync with extension
        await syncWithExtension(goals);

        setSavingStatus('saved');
        toast.success('Goals updated!');
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
            <GoalInput 
                label="Daily Replies" 
                value={goals.replies} 
                min={0} max={50} unit="replies"
                onChange={(val: number) => setGoals({...goals, replies: val})} 
            />
            <GoalInput 
                label="Daily Tweets" 
                value={goals.tweets} 
                min={0} max={20} unit="tweets"
                onChange={(val: number) => setGoals({...goals, tweets: val})} 
            />
            <GoalInput 
                label="DMs Sent" 
                value={goals.dms} 
                min={0} max={30} unit="msgs"
                onChange={(val: number) => setGoals({...goals, dms: val})} 
            />
            
            <div className="pt-4 border-t border-gray-100 flex justify-end">
                 <Button 
                    onClick={handleSaveGoals} 
                    disabled={savingStatus === 'saving'}
                    className={`transition-all duration-300 ${savingStatus === 'saved' ? 'bg-gray-900 hover:bg-gray-800 border-transparent text-white' : ''}`}
                 >
                    {savingStatus === 'saving' ? (
                        <div className="flex items-center gap-2">
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             <span>Saving...</span>
                        </div>
                    ) : savingStatus === 'saved' ? (
                        <div className="flex items-center gap-2">
                             <Check className="w-4 h-4" />
                             <span>Saved</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>Update Goals</span>
                        </div>
                    )}
                 </Button>
            </div>
        </BentoCard>
      </section>

      {/* 2. Subscription */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Subscription</h2>
        <BentoCard noPadding className="p-8 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold text-gray-900">StayOnX Pro</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wide">Active</span>
                </div>
                <p className="text-sm text-gray-500">Next billing date: November 24, 2024</p>
            </div>
            <Button variant="outline">Manage Billing</Button>
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