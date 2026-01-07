import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  Square, 
  Users, 
  User, 
  MoreHorizontal, 
  Image, 
  Smile, 
  MapPin,
  CheckCircle2,
  ChevronLeft,
  X,
  BarChart3,
  Share2,
  Download
} from 'lucide-react';

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const HowItWorksDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Spaces' | 'Leaderboard'>('Overview');
  const [isHovered, setIsHovered] = useState(false);

  // Simulation Loop
  useEffect(() => {
    if (isHovered) return; // Pause on hover

    const sequence = [
      { action: () => setIsOpen(true), delay: 1000 },
      { action: () => setActiveTab('Overview'), delay: 1500 },
      { action: () => setActiveTab('Spaces'), delay: 4500 },
      { action: () => setActiveTab('Leaderboard'), delay: 7500 },
      { action: () => setIsOpen(false), delay: 10500 },
      { action: () => setActiveTab('Overview'), delay: 11000 }, // Reset tab while closed
    ];

    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const runSequence = () => {
        if (currentIndex >= sequence.length) {
            currentIndex = 0;
        }
        const step = sequence[currentIndex];
        timeoutId = setTimeout(() => {
            step.action();
            currentIndex++;
            runSequence();
        }, step.delay);
    };

    // Start slightly delayed
    timeoutId = setTimeout(runSequence, 500);

    return () => clearTimeout(timeoutId);
  }, [isHovered]);

  return (
    <div 
        className="w-full max-w-4xl mx-auto h-[420px] bg-black text-white font-sans overflow-hidden rounded-xl border border-gray-800 relative select-none text-xs group/demo shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* --- Main Layout --- */}
      <div className={`flex h-full transition-opacity duration-500 ${isOpen ? 'opacity-30' : 'opacity-80'}`}>
        
        {/* Left Sidebar */}
        <div className="w-[50px] xl:w-[180px] flex flex-col items-center xl:items-start p-2 border-r border-gray-800">
          <div className="mb-3 xl:ml-2">
            <TwitterIcon className="w-5 h-5 text-white" />
          </div>
          
          <nav className="flex flex-col gap-1 w-full">
            <NavItem icon={<Home className="w-5 h-5" strokeWidth={2} />} label="Home" active />
            <NavItem icon={<Search className="w-5 h-5" strokeWidth={2} />} label="Explore" />
            <NavItem icon={<Bell className="w-5 h-5" strokeWidth={2} />} label="Notifications" />
            <NavItem icon={<Mail className="w-5 h-5" strokeWidth={2} />} label="Messages" />
            <NavItem icon={<Square className="w-5 h-5" strokeWidth={2} />} label="Grok" />
            <NavItem icon={<Users className="w-5 h-5" strokeWidth={2} />} label="Communities" />
            <NavItem icon={<User className="w-5 h-5" strokeWidth={2} />} label="Profile" />
          </nav>

          <div className="mt-3 w-full">
            <button className="bg-blue-500 w-8 h-8 xl:w-full xl:h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              <span className="hidden xl:block">Post</span>
              <span className="xl:hidden">+</span>
            </button>
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 min-w-0 border-r border-gray-800 overflow-hidden relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
            <div className="flex">
              <div className="flex-1 h-10 flex items-center justify-center relative">
                <span className="font-bold text-xs">For you</span>
                <div className="absolute bottom-0 w-10 h-0.5 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1 h-10 flex items-center justify-center text-gray-500 text-xs">
                <span>Following</span>
              </div>
            </div>
          </div>

          <div className="pt-10 h-full overflow-y-auto custom-scrollbar">
            {/* Compose */}
            <div className="p-3 border-b border-gray-800 hidden md:block">
               <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                      <div className="bg-transparent text-sm placeholder-gray-500 mb-2">What is happening?!</div>
                      <div className="flex items-center justify-between">
                          <div className="flex gap-2 text-blue-500">
                              <Image className="w-3.5 h-3.5" />
                              <Smile className="w-3.5 h-3.5" />
                              <MapPin className="w-3.5 h-3.5" />
                          </div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Mock Tweet */}
            <div className="p-3 border-b border-gray-800 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex gap-3">
                 <div className="w-8 h-8 bg-gray-600 rounded-full shrink-0"></div>
                 <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                       <span className="font-bold text-xs">Peter Mick</span>
                       <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400/10" />
                       <span className="text-gray-500 text-[10px]">@ThePeterMick · 12h</span>
                    </div>
                    <div className="mb-2 text-xs leading-normal">
                       why opening Apple products is so satisfying?
                    </div>
                    <div className="aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden mb-1 border border-gray-800 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                              <span className="text-gray-500 text-[10px]">Image</span>
                          </div>
                    </div>
                 </div>
              </div>
            </div>
             {/* Another Mock Tweet */}
             <div className="p-3 border-b border-gray-800 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex gap-3">
                 <div className="w-8 h-8 bg-purple-600 rounded-full shrink-0"></div>
                 <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                       <span className="font-bold text-xs">Sarah Dev</span>
                       <span className="text-gray-500 text-[10px]">@sarahcodes · 2h</span>
                    </div>
                    <div className="mb-2 text-xs leading-normal">
                       Just shipped the new dashboard! 🚀 #buildinpublic
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-[240px] p-2 pl-4">
            <div className="relative mb-3">
                <input type="text" placeholder="Search" className="w-full bg-[#202327] rounded-full py-1.5 pl-9 pr-4 text-[10px] focus:outline-none border border-transparent" />
            </div>
             <div className="bg-[#16181c] rounded-xl p-3 mb-2 border border-gray-800">
                <h2 className="font-bold text-sm mb-1">Subscribe to Premium</h2>
                <button className="bg-blue-500 text-white font-bold rounded-full px-3 py-1 text-[10px] mt-2">Subscribe</button>
            </div>
             <div className="bg-[#16181c] rounded-xl p-3 border border-gray-800">
                <h2 className="font-bold text-sm mb-2">What's happening</h2>
                 <div className="mb-3">
                    <div className="font-bold text-xs">#OpenAI</div>
                    <div className="text-[10px] text-gray-500">54.2K posts</div>
                 </div>
            </div>
        </div>
      </div>

      {/* --- StayOnX Overlays --- */}
      
      {/* 1. Closed State: Side Handle */}
      {/* Reduced vertical height as requested */}
      <div 
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
        onClick={() => setIsOpen(true)}
      >
         <div className="bg-gray-200 text-gray-900 py-6 px-1 rounded-l-md flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white transition-colors cursor-pointer">
             <ChevronLeft className="w-3 h-3" strokeWidth={3} />
             <span className="text-[9px] font-bold [writing-mode:vertical-rl] rotate-180 tracking-wide select-none whitespace-nowrap opacity-80">
                 StayOnX
             </span>
         </div>
      </div>

      {/* 2. Open State: Side Panel */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-[300px] bg-[#F3F4F6] text-black shadow-2xl z-40 transition-transform duration-500 ease-in-out font-sans flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                  <span className="font-manrope font-extrabold text-sm tracking-tight text-gray-900">StayOnX</span>
                  <span className="bg-white text-gray-600 px-2 py-0.5 rounded-full text-[9px] font-bold border border-gray-200 shadow-sm">Streak 0</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-gray-200 p-1.5 rounded-full text-gray-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
              </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1.5 gap-1 bg-white border-b border-gray-200">
              {['Overview', 'Spaces', 'Leaderboard'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all duration-200 ${activeTab === tab ? 'bg-gray-100 text-black font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>

          {/* Scrolling Content */}
          <div className="flex-1 overflow-y-auto p-3 bg-[#F9FAFB]">
              
              {activeTab === 'Overview' && (
                  <div className="space-y-3 animate-fade-in">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2">
                          <StatBox label="Replies" value="7/30" />
                          <StatBox label="Tweets" value="0/3" />
                          <StatBox label="DMs" value="0/0" />
                      </div>

                      {/* Activity Graph */}
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-bold text-gray-700">Activity</span>
                              <span className="text-[9px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">Daily</span>
                          </div>
                          <div className="h-24 flex items-end justify-between px-2 gap-1.5 border-b border-dashed border-gray-100 pb-2">
                              {[20, 35, 10, 50, 25, 80, 45].map((h, i) => (
                                  <div key={i} className="w-full bg-blue-50/50 rounded-t-sm relative group overflow-hidden hover:bg-blue-100 transition-colors cursor-pointer">
                                      <div style={{ height: `${h}%` }} className={`absolute bottom-0 w-full rounded-t-sm ${i === 6 ? 'bg-blue-600' : i === 5 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                                  </div>
                              ))}
                          </div>
                          <div className="flex justify-between mt-1 text-[8px] text-gray-400 px-1">
                              <span>Jan 1</span>
                              <span>Jan 7</span>
                          </div>
                      </div>

                      {/* Share Buttons */}
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-700">Share streak</span>
                          <div className="flex gap-2">
                                <button className="flex items-center gap-1 bg-white border border-gray-200 hover:bg-gray-50 px-2.5 py-1 rounded-lg text-[10px] font-medium text-gray-700 transition-all shadow-sm">
                                    <Share2 className="w-3 h-3" /> Share
                                </button>
                                <button className="flex items-center gap-1 bg-white border border-gray-200 hover:bg-gray-50 px-2.5 py-1 rounded-lg text-[10px] font-medium text-gray-700 transition-all shadow-sm">
                                    <Download className="w-3 h-3" />
                                </button>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'Spaces' && (
                  <div className="space-y-3 animate-fade-in">
                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                          <h3 className="font-bold text-xs text-gray-900 mb-1">Browse Spaces</h3>
                          <p className="text-[10px] text-gray-500 mb-3">Discover curated spaces on the website and join communities.</p>
                          <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm">
                              Open Website
                          </button>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-xs text-gray-900 mb-2">Join via Invitation Code</h3>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Enter space code" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" />
                                <button className="bg-black text-white px-3 py-1 rounded-lg text-[10px] font-bold shadow-md hover:bg-gray-800 transition-colors">Join</button>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-2.5 text-center">To create a Space, use the website.</p>
                      </div>
                  </div>
              )}

              {activeTab === 'Leaderboard' && (
                  <div className="space-y-2 animate-fade-in">
                      <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex mb-2">
                          <button className="flex-1 py-1 text-[10px] font-bold bg-white shadow-sm rounded-md border border-gray-100 text-gray-900">Individual</button>
                          <button className="flex-1 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-900 transition-colors">Spaces</button>
                      </div>

                      <div className="space-y-1.5">
                        <LeaderboardItem rank={1} name="@munier_ie" score="164 replies" isUser />
                        <LeaderboardItem rank={2} name="@cwsacn07" score="0 replies" />
                        <LeaderboardItem rank={3} name="@user_xyz" score="0 replies" />
                      </div>
                  </div>
              )}

              <div className="mt-4 bg-gray-100/50 p-3 rounded-xl border border-dashed border-gray-300">
                  <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-gray-800">Sponsored</span>
                      <div className="flex gap-1">
                          <span className="text-[8px] bg-white border border-gray-200 rounded px-1 text-gray-500">Ad</span>
                          <span className="text-[8px] bg-white border border-gray-200 rounded px-1 text-gray-500">Stats</span>
                      </div>
                  </div>
                  <p className="text-[9px] text-gray-500 mb-2">Advertise your brand here. Reach engaged users.</p>
                  <button className="w-full bg-white border border-gray-200 hover:bg-white hover:shadow-md py-1.5 rounded-lg text-[10px] font-medium transition-all shadow-sm text-gray-700">Secure your slot</button>
              </div>

          </div>
      </div>

    </div>
  );
};

// Helper Components
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 p-2 rounded-full cursor-pointer transition-colors w-max xl:w-full ${active ? 'font-bold' : ''} `}>
        <div className={`w-5 h-5 flex items-center justify-center ${active ? 'text-white' : 'text-white'}`}>
            {icon}
        </div>
        <span className={`text-sm hidden xl:block ${active ? 'text-white' : 'text-white'}`}>{label}</span>
    </div>
);

const StatBox = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
        <div className="text-[9px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-extrabold text-gray-900">{value}</div>
    </div>
);

const LeaderboardItem = ({ rank, name, score, isUser = false }: { rank: number, name: string, score: string, isUser?: boolean }) => (
    <div className={`flex items-center p-2 rounded-xl border transition-all ${isUser ? 'bg-blue-50/30 border-blue-200/60 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
        <div className={`w-6 h-6 flex items-center justify-center font-bold text-xs mr-2 ${rank === 1 ? 'text-yellow-600 bg-yellow-100/50 rounded-full' : rank === 2 ? 'text-gray-500 bg-gray-100 rounded-full' : rank === 3 ? 'text-amber-700 bg-amber-100/50 rounded-full' : 'text-gray-400'}`}>
            #{rank}
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mr-2 flex-shrink-0 border border-white shadow-sm">
             {/* Mock Avatar */}
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold truncate text-gray-900">{name}</div>
        </div>
        <div className="text-[9px] font-medium text-gray-500 bg-gray-100/80 px-1.5 py-0.5 rounded-md">{score}</div>
    </div>
);
