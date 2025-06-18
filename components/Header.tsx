
import React, { useState } from 'react';
import type { User, AuthStatus } from '../types';
import { FREE_TIER_GENERATIONS_PER_DAY, ANONYMOUS_FREE_GENERATIONS } from '../types'; 

interface HeaderProps {
  user: User | null;
  authStatus: AuthStatus;
  onOpenAuthModal: () => void; // Changed from onSignIn
  onSignOut: () => void;
  onTogglePaid: () => void;
  dailyGenerations: { used: number; limit: number };
  onToggleProfilePanel: () => void; 
  hasNewAchievements?: boolean; 
  // onOpenSignUpPrompt: () => void; // This will be covered by onOpenAuthModal
}

const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

interface PremiumIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const PremiumIcon: React.FC<PremiumIconProps> = (props) => {
  const { title, ...rest } = props; 
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...rest}>
      {title && <title>{title}</title>} 
      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62 3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
    </svg>
  );
};


export const Header: React.FC<HeaderProps> = ({ 
    user, authStatus, onOpenAuthModal, onSignOut, onTogglePaid, 
    dailyGenerations, onToggleProfilePanel, hasNewAchievements
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const generationProgressWidth = dailyGenerations.limit > 0 ? (dailyGenerations.used / dailyGenerations.limit) * 100 : 0;
  const displayLimit = user ? (user.isPaid ? dailyGenerations.limit : `${FREE_TIER_GENERATIONS_PER_DAY}+`) : ANONYMOUS_FREE_GENERATIONS;
  const generationsText = user ? "Generations Today" : "Free Generations Used";


  return (
    <header className="bg-[#80CBC4] text-[#FAFAFA] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
           <svg 
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 100 100" 
            className="h-8 w-auto mr-3"
          >
            <defs><style>{`.icon-fill { fill: #FAFAFA; }`}</style></defs>
            <title>Recipify Magic Spoon Logo</title>
            <ellipse cx="50" cy="48" rx="28" ry="32" className="icon-fill"/>
            <rect x="42" y="70" width="16" height="28" rx="6" ry="6" className="icon-fill"/>
            <path d="M30 7 L33 10 L30 13 L27 10 Z" className="icon-fill" />
            <path d="M85 36 L89 40 L85 44 L81 40 Z" className="icon-fill" />
            <path d="M25 23 L27 25 L25 27 L23 25 Z" className="icon-fill" />
          </svg>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-['Poppins'] text-[#FAFAFA]">
            Recipify
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {(authStatus === 'authenticated' || authStatus === 'unauthenticated') && dailyGenerations.limit !== Infinity && (
             <div className="hidden sm:flex flex-col items-end text-xs mr-2">
                <span className="font-['Roboto'] text-sm font-medium text-[#004D40]">{generationsText}: {dailyGenerations.used}/{displayLimit}</span>
                <div className="w-24 h-1.5 bg-[#004D40]/40 rounded-full overflow-hidden mt-0.5"> 
                    <div 
                        className={`h-full ${dailyGenerations.used >= dailyGenerations.limit ? 'bg-[#FF8A65]' : 'bg-[#4DB6AC]'}`}
                        style={{ width: `${Math.min(generationProgressWidth, 100)}%` }}
                        title={`${dailyGenerations.used}/${displayLimit} generations used`}
                    ></div>
                </div>
            </div>
          )}
          <div className="relative">
            {authStatus === 'loading' && <div className="text-sm font-['Roboto'] text-[#FAFAFA]">Loading...</div>}
            {authStatus === 'unauthenticated' && (
              <button 
                onClick={() => { onOpenAuthModal(); setShowDropdown(false);}} // Updated to onOpenAuthModal
                className="bg-[#546E7A] hover:bg-[#455A64] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-150 flex items-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-[#546E7A] focus:ring-offset-2" 
              >
                <UserCircleIcon /> <span className="font-['Poppins']">Sign Up / Sign In</span>
              </button>
            )}
            {authStatus === 'authenticated' && user && (
              <div>
                <button 
                  onClick={() => { onToggleProfilePanel(); setShowDropdown(false); }}
                  className="flex items-center gap-2 text-[#FAFAFA] hover:text-white/80 relative"
                  aria-label="Open user profile and achievements"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border-2 border-[#80CBC4]" /> 
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-[#FAFAFA]" /> 
                  )}
                  <span className="hidden sm:inline font-['Poppins'] text-[#FAFAFA]">{user.name}</span>
                  {user.isPaid && <PremiumIcon className="text-[#FF8A65] w-5 h-5 ml-1" title="Recipify Pro User"/>}
                  {hasNewAchievements && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" title="New achievements!"></span>
                  )}
                </button>
                 <button
                    onClick={() => setShowDropdown(prev => !prev)}
                    className="ml-1 p-1 rounded-full hover:bg-white/20"
                    aria-label="User settings"
                    aria-expanded={showDropdown}
                    aria-haspopup="true"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                 </button>

                {showDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-20 text-[#394240] ring-1 ring-black ring-opacity-5"
                    role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button"
                  >
                    <div className="py-1" role="none">
                      <div className="px-4 py-2 text-sm text-[#607D8B] font-['Roboto']">
                        Signed in as <strong className="block font-['Poppins'] text-[#394240]">{user.email || user.name}</strong>
                        {user.isPaid && <span className="block text-xs text-[#FF8A65] font-semibold font-['Poppins']">Recipify Pro Member</span>}
                      </div>
                       <button
                          onClick={() => { onToggleProfilePanel(); setShowDropdown(false); }}
                          className="w-full text-left block px-4 py-2 text-sm text-[#394240] hover:bg-neutral-100 font-['Poppins']"
                          role="menuitem"
                        >
                          View Profile & Achievements
                        </button>
                      <button
                          onClick={() => { onTogglePaid(); setShowDropdown(false); }}
                          className="w-full text-left block px-4 py-2 text-sm text-[#394240] hover:bg-neutral-100 font-['Poppins']"
                          role="menuitem"
                        >
                          {user.isPaid ? 'Switch to Free (Simulated)' : 'Upgrade to Pro (Simulated)'}
                        </button>
                      <button
                        onClick={() => { onSignOut(); setShowDropdown(false); }}
                        className="w-full text-left block px-4 py-2 text-sm text-[#FF8A65] hover:bg-[#FFF0E6] hover:text-[#E65100] font-['Poppins']"
                        role="menuitem"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
