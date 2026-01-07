import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { HowItWorksDemo } from '../components/HowItWorksDemo';
import { 
  ShieldCheck, 
  ArrowRight,
  Download,
  XCircle,
  CheckCircle2
} from 'lucide-react';

export const Features: React.FC = () => {
    const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 text-center">
        <h1 className="text-5xl font-light text-gray-900 tracking-tight max-w-4xl mx-auto mb-6">
          Features designed for <br/><span className="font-normal border-b-2 border-gray-900 leading-tight">unbreakable consistency.</span>
        </h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto mb-16">
            Willpower is a finite resource. Systems are forever. We built StayOnX to bypass your motivation and tap into your biology.
        </p>
        
        <div className="space-y-32 text-left">
            
            {/* Feature 1: Spaces */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <div className="w-12 h-1 rounded-full bg-blue-600"></div>
                    <div>
                         <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">1. The Tribe</span>
                        <h3 className="text-3xl font-light text-gray-900 mt-2">Spaces: Shared Fate</h3>
                    </div>
                    <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                        It's easy to let yourself down. It's much harder to let your team down. 
                        When you join a Space, you aren't just an individual anymore. You are a node in a network.
                        <br/><br/>
                        <strong className="text-gray-900">Psychology:</strong> Exploits positive peer pressure. If you commit to a "Designers" space, your identity as a designer is on the line.
                    </p>
                </div>
                <div className="relative">
                     <div className="absolute -inset-4 bg-blue-50/50 rounded-3xl -z-10 transform rotate-2"></div>
                     <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-8">
                         <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-blue-50 rounded-lg">
                                     <div className="w-6 h-6 text-blue-600 font-bold flex items-center justify-center">#</div>
                                 </div>
                                 <div>
                                     <div className="font-medium text-gray-900">Indie Hackers</div>
                                     <div className="text-xs text-gray-400">12 Members • 92% Streak</div>
                                 </div>
                             </div>
                             <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                                 Active
                             </div>
                         </div>
                         <div className="space-y-4">
                             {[1,2,3].map(i => (
                                 <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                     <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>
                                     <div className="flex-1">
                                         <div className="h-2.5 w-24 bg-gray-200 rounded mb-1.5"></div>
                                         <div className="h-2 w-16 bg-gray-100 rounded"></div>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-xs font-bold text-gray-900">5/5</div>
                                         <div className="text-[10px] text-gray-400">Replies</div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                         <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                             <div className="text-xs text-gray-400 mb-2">Team Streak</div>
                             <div className="text-3xl font-light text-gray-900">14 Days</div>
                         </div>
                     </div>
                </div>
            </div>

            {/* Feature 2: Lock In - Reversed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 <div className="relative order-2 lg:order-1">
                     <div className="absolute -inset-4 bg-orange-50/50 rounded-3xl -z-10 transform -rotate-2"></div>
                     <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-8 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                         <div className="space-y-6">
                             <div>
                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Daily Goal</label>
                                 <div className="text-4xl font-light text-gray-900 mt-1 flex items-baseline gap-2">
                                     20 <span className="text-lg text-gray-400">Replies/day</span>
                                 </div>
                             </div>
                             
                             <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                                <div className="p-1.5 bg-white rounded-md shadow-sm">
                                     <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-orange-900">Locked for 6 days</div>
                                    <div className="text-xs text-orange-700/80 mt-0.5">You cannot lower this goal until the timer expires.</div>
                                </div>
                             </div>

                             <div className="opacity-50 pointer-events-none">
                                 <div className="h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium">
                                     Edit Goals (Disabled)
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
                <div className="space-y-6 order-1 lg:order-2">
                    <div className="w-12 h-1 rounded-full bg-orange-600"></div>
                    <div>
                         <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">2. The Commitment</span>
                        <h3 className="text-3xl font-light text-gray-900 mt-2">Proactive Locking</h3>
                    </div>
                    <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                        "I'll do it tomorrow" is the lie that kills dreams. StayOnX forces you to <strong className="text-gray-900">Lock In</strong> your goals for 7, 14, or 30 days. 
                        Once locked, you cannot lower existing goals or quit your space without penalty.
                        <br/><br/>
                        <strong className="text-gray-900">Psychology:</strong> Pre-commitment strategy (Ulysses pact). You make the decision once, when you are motivated.
                    </p>
                </div>
            </div>

            {/* Feature 3: Streaks & Reset */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <div className="w-12 h-1 rounded-full bg-red-600"></div>
                    <div>
                         <span className="text-xs font-bold text-red-600 uppercase tracking-widest">3. The Stakes</span>
                        <h3 className="text-3xl font-light text-gray-900 mt-2">The "Zero" Protocol</h3>
                    </div>
                    <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                        Most apps let you keep your streak with a "repair." We don't.
                        If you miss a single day, your streak resets. If you are in a Team Space, <strong className="text-red-600">everyone's streak resets.</strong>
                        <br/><br/>
                        <strong className="text-gray-900">Psychology:</strong> Loss Aversion. We are wired to fear loss 2x more than we value gain.
                    </p>
                </div>
                <div className="relative">
                     <div className="absolute -inset-4 bg-red-50/50 rounded-3xl -z-10 transform rotate-1"></div>
                     <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-8 text-center">
                         <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6 relative">
                             <div className="w-10 h-10 text-red-600">
                                 <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-5-8-5-8S1 10.62 1 12a2.5 2.5 0 002.5 2.5c.5 0 .9-.2 1.25-.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c.35.3.75.5 1.25.5zM23 12c0-1.38-5-8-5-8s-5 6.62-5 8a2.5 2.5 0 002.5 2.5c.5 0 .9-.2 1.25-.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c.35.3.75.5 1.25.5 0 0 .9-.2 1.25-.5zm-6.5-6c0-1.38-5-8-5-8s-5 6.62-5 8a2.5 2.5 0 002.5 2.5c.5 0 .9-.2 1.25-.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c.35.3.75.5 1.25.5z" /></svg>
                             </div>
                             <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm text-xs font-bold text-red-600">!</div>
                         </div>
                         <h4 className="text-6xl font-extralight text-gray-900 tracking-tighter mb-2">0</h4>
                         <div className="text-red-500 font-medium tracking-wide uppercase text-xs">Streak Reset</div>
                         <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 leading-relaxed">
                             "I missed yesterday because I was tired. <br/>Now I have to start all over again."
                         </div>
                     </div>
                </div>
            </div>

            {/* Feature 4: Leaderboard - Reversed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 <div className="relative order-2 lg:order-1">
                     <div className="absolute -inset-4 bg-purple-50/50 rounded-3xl -z-10 transform -rotate-1"></div>
                     <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-0 overflow-hidden">
                         <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                             <div className="text-sm font-bold text-gray-900">Space Leaderboard</div>
                             <div className="text-xs text-gray-400">Global</div>
                         </div>
                         {[
                             { name: "Ship Fast", score: "42 Days", emoji: "🚀", active: false },
                             { name: "Design Daily", score: "38 Days", emoji: "🎨", active: true },
                             { name: "Writers Block", score: "12 Days", emoji: "✍️", active: false },
                         ].map((space, i) => (
                             <div key={i} className={`flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 ${space.active ? 'bg-purple-50/20' : ''}`}>
                                 <div className="w-6 text-center font-bold text-gray-300">#{i+1}</div>
                                 <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm">
                                     {space.emoji}
                                 </div>
                                 <div className="flex-1">
                                     <div className={`text-sm font-medium ${space.active ? 'text-purple-900' : 'text-gray-900'}`}>{space.name}</div>
                                     <div className="text-xs text-gray-400">Public Space</div>
                                 </div>
                                 <div className={`text-sm font-bold ${space.active ? 'text-purple-600' : 'text-gray-900'}`}>
                                     {space.score}
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
                <div className="space-y-6 order-1 lg:order-2">
                    <div className="w-12 h-1 rounded-full bg-purple-600"></div>
                    <div>
                         <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">4. The Glory</span>
                        <h3 className="text-3xl font-light text-gray-900 mt-2">Leaderboards & Badges</h3>
                    </div>
                    <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                        Status is the ultimate currency. Compete against other Spaces for supremacy. Earn badges not for participation, but for elite consistency.
                        <br/><br/>
                        <strong className="text-gray-900">Psychology:</strong> Status seeking. Seeing your name climb the ranks triggers dopamine and reinforces the behavior loop.
                    </p>
                </div>
            </div>       
        </div>
      </div>

       {/* Sticky Bottom Bar */}
       <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-6 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="hidden md:block">
                  <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-gray-400" />
                      Ready to lock in your goals?
                  </span>
              </div>
              <Button size="lg" className="shadow-xl" onClick={() => navigate('/install-extension')}>
                  Climb the Leaderboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
          </div>
      </div>

    </div>
  );
};
