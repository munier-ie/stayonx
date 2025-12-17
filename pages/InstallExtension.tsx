import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Puzzle, CheckCircle2, ArrowRight } from 'lucide-react';

export const InstallExtension: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-24 pb-12">
        <div className="w-full max-w-[600px] px-6">
            <h1 className="text-3xl font-light text-gray-900 mb-12 text-center">Setup StayOnX</h1>
            
            <div className="relative pl-8 border-l border-gray-200 space-y-16">
                
                {/* Step 1 */}
                <div className={`relative transition-opacity duration-500 ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 ${currentStep >= 1 ? 'border-black' : 'border-gray-200'}`}>
                        <span className={`text-xs font-bold ${currentStep >= 1 ? 'text-black' : 'text-gray-300'}`}>1</span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add to Chrome</h3>
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl shadow-sm mb-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                <Puzzle className="w-6 h-6 text-gray-900" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">StayOnX Extension</div>
                                <div className="text-xs text-gray-500">version 1.0.4 • Productivity</div>
                            </div>
                        </div>
                        <Button fullWidth onClick={() => setCurrentStep(2)}>Open Chrome Web Store</Button>
                    </div>
                </div>

                {/* Step 2 */}
                <div className={`relative transition-opacity duration-500 ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 ${currentStep >= 2 ? 'border-black' : 'border-gray-200'}`}>
                         <span className={`text-xs font-bold ${currentStep >= 2 ? 'text-black' : 'text-gray-300'}`}>2</span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Pin to Toolbar</h3>
                    <div className="bg-gray-900 rounded-xl p-6 shadow-xl mb-4 overflow-hidden relative group cursor-pointer" onClick={() => setCurrentStep(3)}>
                         <div className="absolute top-4 right-4 animate-bounce">
                             <ArrowRight className="w-5 h-5 text-white rotate-[-45deg]" />
                         </div>
                         <div className="flex items-center gap-2 text-white/80 text-sm border-b border-white/10 pb-2">
                             <Puzzle className="w-4 h-4" />
                             <span>Extensions</span>
                         </div>
                         <div className="mt-3 space-y-2">
                             <div className="flex items-center justify-between p-2 rounded bg-white/10">
                                 <span className="text-white text-sm">StayOnX</span>
                                 <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                             </div>
                         </div>
                         <div className="mt-4 text-center">
                             <span className="text-xs text-gray-400">Click to confirm pin</span>
                         </div>
                    </div>
                </div>

                {/* Step 3 */}
                <div className={`relative transition-opacity duration-500 ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 ${currentStep >= 3 ? 'border-black' : 'border-gray-200'}`}>
                         <span className={`text-xs font-bold ${currentStep >= 3 ? 'text-black' : 'text-gray-300'}`}>3</span>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Account</h3>
                    <div className="p-8 border border-gray-200 rounded-xl flex flex-col items-center justify-center h-40 bg-gray-50/50">
                        {isConnected ? (
                            <div className="flex flex-col items-center animate-fade-in-up">
                                <CheckCircle2 className="w-12 h-12 text-green-600 mb-3" />
                                <span className="text-sm font-medium text-gray-900">Connected Successfully</span>
                                <Button variant="ghost" className="mt-2" onClick={() => window.location.href = '/#/dashboard'}>Go to Dashboard</Button>
                            </div>
                        ) : (
                            <Button onClick={handleConnect} disabled={isConnecting} className="min-w-[160px]">
                                {isConnecting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Connecting...
                                    </span>
                                ) : "Connect X Account"}
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};