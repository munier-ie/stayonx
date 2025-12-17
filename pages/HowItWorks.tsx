import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { Download, Users, TrendingUp } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-5xl font-light text-gray-900 tracking-tight max-w-2xl mb-16">
          Consistency is a <br/><span className="font-normal">team sport.</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Install */}
          <BentoCard className="min-h-[400px] flex flex-col justify-between relative bg-white border-gray-200">
             <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50 m-2 rounded-xl border border-dashed border-gray-200">
                {/* Wireframe Browser Illustration */}
                <div className="w-48 h-32 bg-white border-2 border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
                    <div className="h-4 border-b border-gray-200 flex items-center gap-1 px-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute bottom-2 right-2 w-12 h-6 bg-gray-900 rounded-full opacity-10"></div>
                    </div>
                </div>
             </div>
             <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">1. Install & Connect</h3>
                <p className="text-sm text-gray-500">Add the extension to Chrome. It overlays quietly on X to track your daily actions automatically.</p>
             </div>
          </BentoCard>

          {/* Card 2: Spaces */}
          <BentoCard className="min-h-[400px] flex flex-col justify-between relative bg-white border-gray-200">
             <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50 m-2 rounded-xl border border-dashed border-gray-200">
                <div className="flex -space-x-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-16 h-16 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center z-10">
                            <Users className="w-6 h-6 text-gray-400" />
                        </div>
                    ))}
                </div>
             </div>
             <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">2. Join a Space</h3>
                <p className="text-sm text-gray-500">Create or join a team. Set shared goals. If one person misses a day, the team streak breaks.</p>
             </div>
          </BentoCard>

          {/* Card 3: Compete */}
          <BentoCard className="min-h-[400px] flex flex-col justify-between relative bg-white border-gray-200">
             <div className="flex-1 flex items-end justify-center p-8 bg-gray-50/50 m-2 rounded-xl border border-dashed border-gray-200 gap-2">
                <div className="w-8 h-12 bg-gray-200 rounded-t-sm"></div>
                <div className="w-8 h-20 bg-gray-300 rounded-t-sm"></div>
                <div className="w-8 h-32 bg-gray-900 rounded-t-sm shadow-lg"></div>
             </div>
             <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">3. Climb the Leaderboard</h3>
                <p className="text-sm text-gray-500">Compete against other spaces. Earn badges for volume, consistency, and quality.</p>
             </div>
          </BentoCard>
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