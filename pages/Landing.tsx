import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { Check, Users, Star, Twitter, Chrome, Activity, Crown, PenTool, Reply, Play } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Visual Components ---

const StreakVisual = () => (
  <div className="flex flex-col items-center justify-center h-full w-full p-4 relative overflow-hidden">
    <div className="relative z-10">
      <motion.div
        className="text-6xl font-light text-gray-900 tracking-tighter"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        42
      </motion.div>
      <motion.div
        className="absolute -top-1 -right-4 text-gray-400"
        animate={{ 
          y: [0, -5, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </motion.div>
    </div>
    <div className="text-sm text-gray-500 mt-2 font-medium">Day Streak</div>
  </div>
);

const TeamVisual = () => (
  <div className="flex items-center justify-center h-full w-full gap-4 relative overflow-hidden">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center relative z-10"
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      >
         <img src={`https://picsum.photos/seed/${i + 45}/100/100`} alt="Avatar" className="w-full h-full object-cover rounded-full grayscale opacity-80" />
         {i === 3 && (
           <motion.div 
             className="absolute inset-0 border-2 border-green-500/50 rounded-full"
             initial={{ scale: 1 }}
             animate={{ scale: 1.2, opacity: 0 }}
             transition={{ duration: 1.5, repeat: Infinity }}
           />
         )}
      </motion.div>
    ))}
    <motion.div 
      className="absolute h-0.5 bg-gray-200 w-32 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-0"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      transition={{ duration: 0.8 }}
    />
  </div>
);

const LeaderboardVisual = () => (
  <div className="w-full h-full flex flex-col gap-3 p-6 justify-center">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="h-8 w-full bg-white rounded border border-gray-200 shadow-sm flex items-center px-3 gap-3"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: i * 0.15 }}
      >
        <span className="text-xs font-bold text-gray-400">0{i}</span>
        <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
             <motion.div 
                className="h-full bg-gray-900"
                initial={{ width: "0%" }}
                whileInView={{ width: `${90 - i * 20}%` }}
                transition={{ duration: 1, delay: 0.5 }}
             />
        </div>
      </motion.div>
    ))}
  </div>
);

const ActivityVisual = () => (
  <div className="w-full h-full flex items-end justify-between p-6 gap-2">
    {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
      <motion.div
        key={i}
        className="w-full bg-gray-200 rounded-t-[2px] hover:bg-gray-400 transition-colors"
        initial={{ height: 0 }}
        whileInView={{ height: `${h}%` }}
        transition={{ duration: 0.8, delay: i * 0.05, ease: "backOut" }}
      />
    ))}
  </div>
);

const words = ["consistency", "accountability", "momentum"];

const testimonials = [
  {
    name: "Sarah Jenkins",
    handle: "@sarah_builds",
    text: "My consistency on X has skyrocketed since using @StayonX. The fear of breaking my team's streak is the best motivator I've found. 🚀",
    date: "10:42 AM · Oct 12, 2025",
    avatarColor: "bg-blue-100"
  },
  {
    name: "Jakob Nielsen",
    handle: "@jakob_n",
    text: "The gamification is subtle but addictive. I used to tweet once a week, now I'm on a 45-day streak. The leaderboard is fierce! 🔥",
    date: "2:15 PM · Nov 03, 2025",
    avatarColor: "bg-green-100"
  },
  {
    name: "Eliza M.",
    handle: "@eliza_design",
    text: "Finally, an extension that feels native to X. It doesn't clutter my feed, just quietly tracks my progress. Love the minimalist approach.",
    date: "9:30 AM · Nov 15, 2025",
    avatarColor: "bg-purple-100"
  },
  {
    name: "Marcus Chen",
    handle: "@mchen_dev",
    text: "I joined the 'Ship 30' space and the accountability is real. We lost our streak once and I felt terrible. Never again.",
    date: "11:20 AM · Nov 22, 2025",
    avatarColor: "bg-orange-100"
  },
  {
    name: "David Okon",
    handle: "@david_o",
    text: "Peer pressure works. My reply volume is up 300% since joining the Indie Hackers space. Best tool for growth.",
    date: "4:45 PM · Dec 01, 2025",
    avatarColor: "bg-red-100"
  }
];

const heroCards = [
    { icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-gray-900"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>, label: "X" },
    { icon: <PenTool className="w-10 h-10 text-gray-900 stroke-[1.5px]" />, label: "Tweet" },
    { icon: <Reply className="w-10 h-10 text-gray-900 stroke-[1.5px]" />, label: "Reply" },
    { icon: <span className="text-6xl font-light text-gray-900 font-serif italic relative -top-1">s</span>, label: "StayOnX" }, 
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeCard, setActiveCard] = useState(0);

  // Typing Effect Logic
  useEffect(() => {
    const currentWord = words[wordIndex];
    const typeSpeed = isDeleting ? 50 : 150;

    const handleType = () => {
      if (!isDeleting) {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        if (displayedText.length === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayedText(currentWord.substring(0, displayedText.length - 1));
        if (displayedText.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(handleType, typeSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, wordIndex]);

  // Testimonial Cycle Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000); // Speed increased from 5000 to 4000
    return () => clearInterval(interval);
  }, []);

  // Hero Card Auto-Focus Cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % heroCards.length);
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  // Scroll Animation Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-appear');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-trigger').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white relative">
      
      {/* 1. Hero Section */}
      <section className="min-h-[90vh] flex flex-col justify-center relative overflow-hidden bg-white pb-20">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gray-50 opacity-50 z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-50 to-gray-200 rounded-full blur-3xl opacity-40 animate-pulse duration-[10s]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-gray-200 to-transparent rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pt-20 lg:pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Left: Copy */}
            <div className="space-y-8 animate-fade-in-up flex flex-col items-center lg:items-start text-center lg:text-left" style={{ animationFillMode: 'both' }}>
              <h1 className="text-5xl md:text-7xl font-light text-gray-900 tracking-tight leading-[1.1]">
                Build a habit of <br />
                <span className="font-normal inline-block min-w-[300px]">
                  [{displayedText}<span className="animate-pulse">|</span>]
                </span>
              </h1>
              <p className="text-xl text-gray-500 font-light max-w-lg leading-relaxed">
                The operating system for your X performance. Track replies, maintain streaks, and lock in daily goals with your team.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/install-extension')}
                  className="bg-gray-900 text-white hover:bg-gray-800 rounded-none md:rounded-sm px-8 py-4 h-auto text-lg hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-gray-200"
                >
                  Add to Chrome
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                      ))}
                  </div>
                  <span>Trusted by 2,000+ creators</span>
              </div>
            </div>

            {/* Right: Visual (Auto-Focusing Stacked Cards) */}
            <div className="relative h-[600px] hidden lg:flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="relative w-64 h-64 transform rotate-x-60 rotate-z-45 perspective-1000">
                  {heroCards.map((card, i) => {
                      const isActive = i === activeCard;
                      return (
                          <div 
                              key={i}
                              className={`absolute w-32 h-32 border backdrop-blur-md rounded-2xl flex items-center justify-center transition-all duration-700 ease-out-expo
                                  ${isActive 
                                      ? 'bg-white border-gray-300 shadow-xl opacity-100 scale-105' 
                                      : 'bg-white/60 border-gray-200 shadow-lg opacity-40 scale-100'
                                  }
                              `}
                              style={{
                                  top: `${i * 40}px`,
                                  left: `${i * 40}px`,
                                  zIndex: isActive ? 50 : 10 - i, // Active card jumps to top
                              }}
                          >
                              <div className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                  {card.icon}
                              </div>
                          </div>
                      );
                  })}
              </div>
            </div>
          </div>

          {/* Hero Video Card */}
          <div className="scroll-trigger opacity-0 translate-y-8 transition-all duration-700 delay-200 ease-out-expo">
             <div className="relative rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm p-3 shadow-2xl mx-auto max-w-5xl">
                {/* Browser Controls */}
                <div className="absolute top-0 left-0 right-0 h-10 flex items-center px-4 gap-2 z-20">
                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>

                {/* Video Placeholder */}
                <div className="rounded-xl overflow-hidden relative aspect-video bg-gray-50 border border-gray-100 shadow-inner group cursor-pointer">
                    <img 
                        src="/thumbnail.png" 
                        alt="Dashboard Preview" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors flex items-center justify-center z-30">
                        <div className="w-20 h-20 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300">
                            <Play className="w-8 h-8 text-gray-900 ml-1 fill-gray-900" />
                        </div>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* 2. Features (The Bento Grid) */}
      <section className="py-24 bg-[#FAFAFA] relative">
         <div className="max-w-7xl mx-auto px-6 w-full">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
                 
                 {/* Card 1: The Extension Overlay (2x2) */}
                 <BentoCard className="md:col-span-2 md:row-span-2 relative overflow-hidden group border-0 shadow-sm scroll-trigger opacity-0 translate-y-8" noPadding>
                    <div className="absolute inset-0 bg-gray-50 flex">
                        {/* Fake X Feed */}
                        <div className="flex-1 p-6 space-y-4 opacity-40">
                             {[1,2,3].map(i => (
                                 <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                                     <div className="flex gap-2">
                                         <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                         <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                     </div>
                                     <div className="w-full h-12 bg-gray-100 rounded"></div>
                                 </div>
                             ))}
                        </div>
                        {/* Extension Sidebar Overlay */}
                        <div className="w-64 bg-white border-l border-gray-200 shadow-2xl transform translate-x-8 md:translate-x-0 transition-transform duration-500 p-4 z-10 flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
                                    <Activity className="w-3 h-3 text-white" />
                                </div>
                                <span className="font-semibold text-sm">StayOnX</span>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Daily Streak</div>
                                    <div className="text-2xl font-light text-gray-900 flex items-center gap-2">
                                        12 <span className="text-gray-400 text-sm">days</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-gray-900 rounded-full"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Replies</span>
                                        <span>15/20</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
                        <h3 className="text-2xl font-medium text-gray-900">Never leave your feed.</h3>
                        <p className="text-gray-500 mt-2">Log tweets, replies, and DMs directly from the X interface.</p>
                    </div>
                 </BentoCard>

                 {/* Card 2: Streak Visual (1x1) */}
                 <BentoCard className="md:col-span-1 md:row-span-1 relative overflow-hidden border-0 shadow-sm scroll-trigger opacity-0 translate-y-8" noPadding>
                    <StreakVisual />
                 </BentoCard>

                 {/* Card 3: Activity Visual (1x1) */}
                 <BentoCard className="md:col-span-1 md:row-span-1 relative overflow-hidden border-0 shadow-sm scroll-trigger opacity-0 translate-y-8" noPadding>
                    <ActivityVisual />
                 </BentoCard>

                 {/* Card 4: Team Visual (Wide) */}
                 <BentoCard className="md:col-span-2 md:row-span-1 relative overflow-hidden border-0 shadow-sm flex items-center scroll-trigger opacity-0 translate-y-8" noPadding>
                    <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-white z-10 p-6 flex flex-col justify-center">
                         <h3 className="text-xl font-medium text-gray-900">Team Accountability.</h3>
                         <p className="text-sm text-gray-500 mt-2">If one person breaks the streak, everyone does.</p>
                    </div>
                    <div className="flex-1 h-full bg-gray-50/50">
                        <TeamVisual />
                    </div>
                 </BentoCard>

                 {/* Card 5: Leaderboard Visual (1x1) */}
                 <BentoCard className="md:col-span-1 md:row-span-1 relative overflow-hidden border-0 shadow-sm scroll-trigger opacity-0 translate-y-8" noPadding>
                    <div className="absolute top-4 left-6 z-10">
                        <h3 className="text-sm font-medium text-gray-900">Leaderboards</h3>
                    </div>
                    <div className="mt-8 h-full">
                        <LeaderboardVisual />
                    </div>
                 </BentoCard>

             </div>
         </div>
      </section>

      {/* 3. Pricing Section */}
      <section id="pricing" className="py-32 bg-gray-50 border-t border-gray-100 relative">
         <div className="max-w-5xl mx-auto px-6 w-full">
             <div className="text-center mb-16 scroll-trigger opacity-0 translate-y-8">
                 <h2 className="text-3xl font-light text-gray-900">Simple, transparent commitment.</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Free Tier */}
                 <div className="p-8 rounded-2xl border border-gray-200 bg-transparent flex flex-col justify-between hover:border-gray-300 transition-colors scroll-trigger opacity-0 translate-y-8">
                     <div>
                         <h3 className="text-xl font-medium text-gray-900">Starter</h3>
                         <div className="mt-4 mb-6">
                             <span className="text-4xl font-light text-gray-900">$0</span>
                             <span className="text-gray-500">/mo</span>
                         </div>
                         <ul className="space-y-4">
                             {['Personal Dashboard', 'Basic Stats', '1 Space Limit'].map(feat => (
                                 <li key={feat} className="flex items-center gap-3 text-sm text-gray-600">
                                     <Check className="w-4 h-4 text-gray-400" /> {feat}
                                 </li>
                             ))}
                         </ul>
                     </div>
                     <Button variant="outline" className="mt-8 w-full">Install Free</Button>
                 </div>

                 {/* Pro Tier */}
                 <div className="p-8 rounded-2xl border border-gray-200 bg-white shadow-card flex flex-col justify-between relative overflow-hidden scroll-trigger opacity-0 translate-y-8 delay-100">
                     {/* Shine Effect */}
                     <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent transform skew-x-12 animate-[shine_8s_infinite]"></div>

                     <div>
                         <h3 className="text-xl font-medium text-gray-900">Pro</h3>
                         <div className="mt-4 mb-6 relative">
                             <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-light text-gray-900">$0</span>
                                <span className="text-xl text-gray-400 line-through decoration-gray-400 decoration-1">$3.99</span>
                                <span className="text-gray-500">/mo</span>
                             </div>
                             <div className="mt-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-900 text-[10px] font-bold uppercase tracking-wide rounded-sm border border-gray-200">
                                Limited time only
                             </div>
                         </div>
                         <ul className="space-y-4">
                             {['Unlimited Spaces', 'Team Leaderboards', 'Streak Repair Tokens', 'Detailed Analytics', 'Priority Support'].map(feat => (
                                 <li key={feat} className="flex items-center gap-3 text-sm text-gray-900 font-medium">
                                     <Check className="w-4 h-4 text-gray-900" /> {feat}
                                 </li>
                             ))}
                         </ul>
                     </div>
                     <Button variant="primary" className="mt-8 w-full" onClick={() => navigate('/login')}>Start Free Trial</Button>
                 </div>
             </div>
         </div>
      </section>

      {/* 4. Testimonial Section */}
      <section className="py-24 bg-white border-t border-gray-100/50 relative">
        <div className="max-w-5xl mx-auto px-6 w-full">
            <div className="text-center mb-16 scroll-trigger opacity-0 translate-y-8">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trusted by Builders</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left: Cycling Tweet Card Stack */}
                <div className="relative scroll-trigger opacity-0 translate-y-8 transition-all duration-700 ease-out-expo h-[300px] flex items-center justify-center lg:justify-start">
                    <div className="relative w-full max-w-md group cursor-default perspective-1000">
                        {/* Stack Layer 3 (Back) */}
                        <div className="absolute top-4 left-4 w-full h-full bg-gray-50 rounded-2xl border border-gray-100 shadow-sm z-0 transform -rotate-6 transition-transform duration-200 group-hover:-rotate-3 group-hover:translate-x-2"></div>
                        
                        {/* Stack Layer 2 (Middle) */}
                        <div className="absolute top-2 left-2 w-full h-full bg-white rounded-2xl border border-gray-100 shadow-sm z-10 transform -rotate-3 transition-transform duration-200 group-hover:-rotate-1 group-hover:translate-x-1"></div>
                        
                        {/* Stack Layer 1 (Front/Active) */}
                        <div className="bg-white p-8 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative z-20 transform rotate-3 transition-all duration-200 ease-out group-hover:rotate-0 group-hover:-translate-y-2 hover:shadow-2xl">
                            {/* Animated Content */}
                            <div key={activeTestimonial} className="animate-appear">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className={`w-12 h-12 rounded-full ${testimonials[activeTestimonial].avatarColor}`}></div>
                                        <div>
                                            <div className="font-bold text-gray-900">{testimonials[activeTestimonial].name}</div>
                                            <div className="text-gray-500 text-sm">{testimonials[activeTestimonial].handle}</div>
                                        </div>
                                    </div>
                                    <Twitter className="w-5 h-5 text-[#1DA1F2] fill-current" />
                                </div>
                                <p className="text-lg text-gray-900 leading-relaxed mb-4">
                                    {testimonials[activeTestimonial].text}
                                </p>
                                <div className="text-sm text-gray-400">
                                    {testimonials[activeTestimonial].date}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Text Testimonials */}
                <div className="space-y-12 scroll-trigger opacity-0 translate-y-8 transition-all duration-700 delay-200 ease-out-expo">
                    <div className="space-y-4">
                         <p className="text-xl font-light text-gray-600 leading-relaxed">
                            "Finally, an analytics tool that doesn't feel like a spreadsheet. It feels like a natural extension of X."
                         </p>
                         <div>
                             <div className="font-medium text-gray-900">Mark Alen</div>
                             <div className="text-sm text-gray-400">Indie Hacker</div>
                         </div>
                    </div>
                    
                    <div className="w-12 h-px bg-gray-100"></div>

                    <div className="space-y-4">
                         <p className="text-xl font-light text-gray-600 leading-relaxed">
                            "The best way to stay accountable is peer pressure. StayonX gamifies that perfectly."
                         </p>
                         <div>
                             <div className="font-medium text-gray-900">David O</div>
                             <div className="text-sm text-gray-400">Content Creator</div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-32 bg-white flex flex-col items-center justify-center relative">
          <div className="scroll-trigger opacity-0 translate-y-8 transition-all duration-700 ease-out-expo text-center">
              <div className="mb-8 flex justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-subtle border border-gray-100">
                     <Chrome className="w-8 h-8 text-gray-900 stroke-[1.5px]" />
                  </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-tight">
                  Start your streak today.
              </h2>
              <p className="text-gray-400 mb-10 font-light">
                  Join 10,000+ creators building consistency.
              </p>
              
              <Button 
                onClick={() => navigate('/install-extension')}
                className="bg-black text-white hover:bg-gray-800 rounded-md px-8 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add to Chrome - It's Free
              </Button>
          </div>
      </section>

       <style>{`
        .ease-out-expo {
            transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes appear {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-appear {
            animation: appear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes shine {
            0% { left: -100%; opacity: 0; }
            50% { opacity: 0.5; }
            100% { left: 200%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};