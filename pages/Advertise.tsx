import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X as XIcon, HelpCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { toast } from 'sonner';
import { API_URL } from '../src/config';

export const Advertise: React.FC = () => {
  const navigate = useNavigate();
  const [soldOut, setSoldOut] = useState(false);
  const [slotsUsed, setSlotsUsed] = useState(0);
  const [checking, setChecking] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ads/availability`);
      const data = await res.json();
      setSlotsUsed(data.count || 0);
      if (!data.available) {
        setSoldOut(true);
      }
    } catch (err) {
      // console.error('Failed to check availability', err);
    } finally {
      setChecking(false);
    }
  };

  const handlePurchase = async () => {
    if (soldOut || purchasing) return;
    
    setPurchasing(true);
    try {
      const res = await fetch(`${API_URL}/api/payment/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const session = await res.json();
      
      // Dodo API returns checkout_url, not payment_link
      if (session.checkout_url) {
        toast.success('Redirecting to payment...');
        window.location.href = session.checkout_url;
      } else if (session.error) {
        toast.error(session.error || 'Failed to create payment session');
        // console.error('Payment error', session);
      } else {
        toast.error('No checkout URL returned');
        // console.error('No checkout URL returned', session);
      }
    } catch (err) {
      toast.error('Failed to connect to payment service');
      // console.error('Purchase error', err);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-transparent to-transparent opacity-50 -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-display font-semibold tracking-tight text-gray-900 mb-6"
          >
            Own the Feed.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            Most ads get ignored because they look like ads. <br className="hidden md:block" />
            Put your brand where users actually look: <strong>Inside their workflow.</strong>
          </motion.p>
        </div>
      </div>

      {/* Pricing Card Section */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full max-w-md relative group"
            >
              <div className="absolute -inset-px bg-gradient-to-b from-gray-200 to-gray-100 rounded-[32px] opacity-100" />
              <div className="relative h-full bg-white rounded-[31px] p-8 flex flex-col items-center text-center shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/5 border border-gray-900/10 mb-6">
                  <span className={`w-1.5 h-1.5 rounded-full ${soldOut ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                  <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                    {soldOut ? '5/5 Slots Filled' : `${slotsUsed}/5 Slots Filled`}
                  </span>
                </div>

                <h3 className="text-xl font-medium text-gray-900 mb-2">The Monthly Slot</h3>
                <p className="text-sm text-gray-500 mb-8">
                   Complete share of voice. Maximum visibility.
                </p>

                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-5xl font-semibold text-gray-900 tracking-tight">$50</span>
                  <span className="text-lg text-gray-400">/mo</span>
                </div>

                <div className="w-full space-y-4 mb-8">
                    <Button 
                        size="lg" 
                        fullWidth 
                        disabled={soldOut || checking || purchasing}
                        onClick={handlePurchase}
                        className={soldOut ? '!bg-gray-100 !text-gray-400 cursor-not-allowed' : ''}
                    >
                         {checking ? 'Checking Availability...' : purchasing ? 'Processing...' : soldOut ? 'Sold Out (Join Waitlist)' : 'Secure Your Slot'}
                    </Button>
                    {soldOut && (
                        <p className="text-xs text-red-500 font-medium">
                            All 5 slots are currently occupied. Check back next month.
                        </p>
                    )}
                </div>

                <div className="w-full pt-8 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4 text-left">
                        What you get
                    </p>
                    <ul className="space-y-3 text-left">
                        {[
                            "1 of only 5 rotating slots",
                            "Permanent placement on X Sidebar",
                            "100% Native feel (No 'Ad blindness')",
                            "Direct link to your landing page",
                            "Stats tracking (Clicks & Impressions)"
                        ].map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                <Check className="w-5 h-5 text-gray-900 shrink-0" />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>
              </div>
            </motion.div>
        </div>
      </div>

      {/* Comparison / "Why it Works" Table */}
      <div className="max-w-5xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">Why this works better.</h2>
            <p className="text-gray-500">Stop burning money on feeds that scroll past you.</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="py-6 px-8 text-left text-sm font-semibold text-gray-900 w-1/3">Feature</th>
                        <th className="py-6 px-8 text-center text-sm font-semibold text-gray-900 w-1/3 bg-white border-x border-gray-100 relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gray-900" />
                            StayOnX Slot
                        </th>
                        <th className="py-6 px-8 text-center text-sm font-medium text-gray-400 w-1/3">
                            Generic X Ads
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {[
                        {
                            label: "The Context",
                            desc: "Where is the user's mind when they see you?",
                            us: "In 'Work Mode'. Using a tool to grow.",
                            them: "Doomscrolling. Bored. Distracted."
                        },
                        {
                            label: "The Persistence",
                            desc: "Does it disappear when they scroll?",
                            us: "No. It sticks to the side. Always there.",
                            them: "Gone in 0.5 seconds."
                        },
                        {
                            label: "The Trust",
                            desc: "Do they think it's spam?",
                            us: "Looks like a native tool feature.",
                            them: "Clearly a 'Promoted' spam post."
                        },
                         {
                            label: "The Inventory",
                            desc: "How much competition on screen?",
                            us: "Zero competition. Just you.",
                            them: "Competing with 50 other tweets."
                        }
                    ].map((row, i) => (
                        <tr key={i} className="group hover:bg-gray-50/30 transition-colors">
                            <td className="py-6 px-8 align-top">
                                <span className="block font-medium text-gray-900 mb-1">{row.label}</span>
                                <span className="text-xs text-gray-400 leading-relaxed max-w-[200px] block">{row.desc}</span>
                            </td>
                            <td className="py-6 px-8 align-top text-center bg-white border-x border-gray-100">
                                <span className="inline-block py-1 px-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                                    {row.us}
                                </span>
                            </td>
                            <td className="py-6 px-8 align-top text-center">
                                <span className="text-sm text-gray-400">
                                    {row.them}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

