import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoCard } from '../components/BentoCard';
import { Button } from '../components/Button';
import { Check, X as XIcon, HelpCircle } from 'lucide-react';

const faqItems = [
  {
    question: "What happens if I miss a day?",
    answer: "On the Free plan, your streak resets to zero. On Pro, you get 1 Streak Repair Token per month to save your streak if you miss a day due to emergencies."
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes, you can manage your subscription directly from the Settings page. Changes take effect at the start of the next billing cycle."
  },
  {
    question: "How do Team Leaderboards work?",
    answer: "In Pro, you can see detailed leaderboards for your specific Spaces, including metrics like 'Most Consistent' and 'Highest Volume'. Free users only see global rankings."
  },
  {
    question: "What is the 'Space Limit'?",
    answer: "Starter users can join up to 1 Space (e.g., 'Writing' or 'Indie Hackers'). Pro users can join unlimited spaces to track different goals with different groups."
  }
];

const features = [
  { name: "Daily Activity Tracking", free: true, pro: true },
  { name: "Global Leaderboard", free: true, pro: true },
  { name: "Browser Extension", free: true, pro: true },
  { name: "Space Limit", free: "1 Space", pro: "Unlimited" },
  { name: "Analytics History", free: "7 Days", pro: "Unlimited" },
  { name: "Streak Repair Tokens", free: false, pro: "1 per month" },
  { name: "Team Analytics", free: false, pro: true },
  { name: "Private Spaces", free: false, pro: true },
  { name: "Priority Support", free: false, pro: true },
];

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Section */}
      <div className="pt-20 pb-16 text-center max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-6">
          Invest in your <span className="font-normal">consistency.</span>
        </h1>
        <p className="text-lg text-gray-500 font-light mb-10">
          Choose the plan that fits your ambition. Upgrade anytime as you grow.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center relative">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Yearly
            </button>
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
            Save 20%
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          {/* Starter Plan */}
          <BentoCard className="p-8 flex flex-col h-full border-gray-200" noPadding>
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900">Starter</h3>
              <p className="text-sm text-gray-500 mt-2">For individuals building the habit.</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-light text-gray-900">$0</span>
              <span className="text-gray-400">/mo</span>
            </div>
            <Button 
                variant="outline" 
                fullWidth 
                onClick={() => navigate('/install-extension')}
                className="mb-8"
            >
                Install Extension
            </Button>
            <div className="space-y-4 flex-1">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Includes:</p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>Basic Activity Tracking</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>Join 1 Public Space</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>7-Day History</span>
                    </li>
                </ul>
            </div>
          </BentoCard>

          {/* Pro Plan */}
          <BentoCard className="p-8 flex flex-col h-full border-gray-900 shadow-lg relative overflow-hidden" noPadding>
             <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wide">
                 Most Popular
             </div>
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900">Pro</h3>
              <p className="text-sm text-gray-500 mt-2">For serious creators and teams.</p>
            </div>
            <div className="mb-8 relative">
              <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-light text-gray-900">$0</span>
                  <span className="text-xl text-gray-400 line-through decoration-gray-400 decoration-1">
                    ${billingCycle === 'monthly' ? '3.99' : '2.99'}
                  </span>
                  <span className="text-gray-400">/mo</span>
              </div>
              <div className="mt-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-900 text-[10px] font-bold uppercase tracking-wide rounded-sm border border-gray-200">
                  Limited time only
              </div>
            </div>
            <Button 
                variant="primary" 
                fullWidth 
                onClick={() => navigate('/login')}
                className="mb-8"
            >
                Start Free Trial
            </Button>
            <div className="space-y-4 flex-1">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Everything in Starter, plus:</p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-gray-900 font-medium">
                        <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                        <span>Unlimited Spaces</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-900 font-medium">
                        <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                        <span>Unlimited History & Analytics</span>
                    </li>
                     <li className="flex items-start gap-3 text-sm text-gray-900 font-medium">
                        <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                        <span>Streak Repair Tokens</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-900 font-medium">
                        <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                        <span>Private Team Spaces</span>
                    </li>
                </ul>
            </div>
          </BentoCard>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">Compare Features</h2>
            <div className="overflow-hidden border border-gray-200 rounded-2xl bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wide w-1/2">Feature</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wide text-center w-1/4">Starter</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wide text-center w-1/4">Pro</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {features.map((feature, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6 text-sm font-medium text-gray-900">{feature.name}</td>
                                <td className="py-4 px-6 text-sm text-gray-600 text-center">
                                    {feature.free === true ? <Check className="w-4 h-4 text-gray-400 mx-auto" /> : 
                                     feature.free === false ? <XIcon className="w-4 h-4 text-gray-300 mx-auto" /> : 
                                     feature.free}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900 font-medium text-center">
                                    {feature.pro === true ? <Check className="w-4 h-4 text-gray-900 mx-auto" /> : 
                                     feature.pro === false ? <XIcon className="w-4 h-4 text-gray-300 mx-auto" /> : 
                                     feature.pro}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {faqItems.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-start gap-2">
                            <HelpCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            {item.question}
                        </h4>
                        <p className="text-sm text-gray-500 leading-relaxed pl-6">
                            {item.answer}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};