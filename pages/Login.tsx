import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Activity } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      // Supabase handles the redirect, so we don't strictly need to navigate here
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* Background Texture - using the global noise class plus a grid */}
      <div className="absolute inset-0 bg-grid-texture opacity-60 pointer-events-none" />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 pointer-events-none" />

      <div className="w-full max-w-[400px] z-10 px-6 animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-card p-8 md:p-10 text-center">
          
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg shadow-gray-200">
              <Activity className="w-6 h-6 text-white stroke-[2px]" />
            </div>
          </div>

          <h1 className="text-2xl font-medium text-gray-900 mb-3 tracking-tight">
            Sign in to StayOnX
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Stay consistent on X with team accountability.<br/>Build the habit. Keep the streak.
          </p>

          <Button 
            fullWidth 
            size="lg" 
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 h-12 text-[15px]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                {/* Simple X Logo SVG */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
                Sign in with X
              </>
            )}
          </Button>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
              By continuing you agree to our Terms
            </p>
          </div>
        </div>

        <div className="mt-8 text-center flex justify-center gap-6">
          <button onClick={() => navigate('/privacy')} className="text-xs text-gray-400 hover:text-gray-900 transition-colors">Privacy</button>
          <button onClick={() => navigate('/privacy')} className="text-xs text-gray-400 hover:text-gray-900 transition-colors">Terms</button>
          <a href="#" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">Support</a>
        </div>
      </div>
    </div>
  );
};