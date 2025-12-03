import React from 'react';

export const PaperBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative bg-[#fdfbf7] text-gray-800">
      {/* CSS Pattern for faint grid lines to mimic graph paper or notebook */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.05)_100%)]" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};