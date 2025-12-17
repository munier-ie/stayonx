import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-2">
        <h1 className="text-[140px] leading-none font-light text-gray-200 tracking-tighter select-none">
          404
        </h1>
        <p className="text-lg text-gray-500 font-light">
          This page doesn’t exist.
        </p>
        <div className="pt-8">
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Return to dashboard
            </Button>
        </div>
      </div>
    </div>
  );
};