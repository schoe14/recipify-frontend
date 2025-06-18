
import React from 'react';
import type { ActiveTab } from '../types';

interface TabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isUserPaid: boolean; 
}

const tabConfig: { id: ActiveTab; label: string; icon?: JSX.Element; premium?: boolean }[] = [
  { id: 'generator', label: 'Recipe Generator' },
  { id: 'mykitchen', label: 'My Kitchen' }, 
  { id: 'calendar', label: 'Meal Calendar' },
  { id: 'feed', label: 'Feed' }, // Changed from 'Community'
  { id: 'history', label: 'My History' },
  { id: 'saved', label: 'Saved Recipes' },
];

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, isUserPaid }) => {
  const availableTabs = tabConfig.filter(tab => !tab.premium || (tab.premium && isUserPaid));

  return (
    <nav className="bg-white shadow-sm sticky top-[72px] z-40"> {/* Adjust top if header height changes */}
      <div className="container mx-auto px-2 sm:px-4 flex justify-center sm:justify-start space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar"> {/* Added no-scrollbar class */}
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 flex items-center px-3 sm:px-4 py-3 text-sm sm:text-base font-medium border-b-4 transition-colors duration-150 font-['Poppins']
              ${activeTab === tab.id
                ? 'border-[#80CBC4] text-[#80CBC4]' // Mint Fresh
                : 'border-transparent text-[#607D8B] hover:text-[#394240] hover:border-[#9CCC65]' // Slate Gray text, Deep Blueberry hover text, Green Tea hover border
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};
