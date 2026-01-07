import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { HowItWorksDemo } from '../components/HowItWorksDemo';
import { Download, Users, TrendingUp } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-5xl font-light text-gray-900 tracking-tight max-w-2xl mb-16">
          Consistency is a <br/><span className="font-normal">team sport.</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Step Breakdown */}
            <div className="lg:col-span-5 space-y-12">
                {/* Step 1 */}
                <div className="relative pl-8 border-l border-gray-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-4 border-white"></div>
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 1</span>
                        <h3 className="text-xl font-medium text-gray-900">Install & Pin</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Add StayOnX to Chrome. Pin it to your toolbar for easy access. It lives quietly inside your X (Twitter) interface, so you never have to switch context.
                        </p>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="relative pl-8 border-l border-gray-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-4 border-white"></div>
                    <div className="space-y-2">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 2</span>
                        <h3 className="text-xl font-medium text-gray-900">Join a Space & Lock In</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Join a themed Space (e.g., "Designers", "Indie Hackers") or create your own. 
                            <strong className="text-gray-900 block mt-2">The Catch: You must "Lock In" your commitment.</strong>
                            Once you join, you commit to hitting your daily goals (e.g., 5 replies/day) for a set duration (minimum 7 days).
                        </p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="relative pl-8 border-l border-gray-900">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-900 border-4 border-white"></div>
                    <div className="space-y-2">
                         <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Step 3</span>
                        <h3 className="text-xl font-medium text-gray-900">Don't Break the Chain</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Every day you hit your goal, your streak increases.
                            <br/>
                            <span className="inline-block bg-red-50 text-red-600 px-2 py-1 rounded text-sm font-medium mt-2 border border-red-100">
                                Warning: If you miss a single day, you (and your space) go back to zero.
                            </span>
                        </p>
                    </div>
                </div>

                {/* Step 4 */}
                <div className="relative pl-8 border-l border-gray-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-4 border-white"></div>
                    <div className="space-y-2">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step 4</span>
                        <h3 className="text-xl font-medium text-gray-900">Climb the Leaderboard</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Compete against other spaces. The most consistent teams rise to the top. Earn badges, gain visibility, and build a habit that sticks.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Live Demo */}
            <div className="lg:col-span-7 sticky top-24">
                 <div className="relative">
                     <div className="absolute -inset-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl opacity-50 blur-2xl"></div>
                     <HowItWorksDemo />
                 </div>
            </div>

        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-6 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="hidden md:block">
                  <span className="text-sm font-medium text-gray-900">Start your streak today.</span>
              </div>
              <Button size="lg" className="shadow-xl" onClick={() => navigate('/install-extension')}>
                  Install Extension <Download className="w-4 h-4 ml-2" />
              </Button>
          </div>
      </div>
    </div>
  );
};