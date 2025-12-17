
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function AuthButton() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    // Clear session in extension
    window.postMessage({ type: 'STAYONX_SESSION_SYNC', session: null }, '*');
    await supabase.auth.signOut();
  };

  if (session) {
    return (
      <button 
        onClick={handleLogout}
        className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
      >
        Sign Out
      </button>
    );
  }

  // Uses existing button styles or similar to blend in
  return (
    <button
      onClick={handleLogin}
      className="bg-black text-white px-4 py-2 rounded-full font-bold text-sm hover:opacity-80 transition-opacity"
    >
      Sign in with X
    </button>
  );
}
