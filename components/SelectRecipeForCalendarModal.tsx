

import React, { useState } from 'react';
// FIX: Add User type
import type { Recipe, MinimalRecipeInfo, User } from '../types';

interface SelectRecipeForCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeSelect: (recipe: MinimalRecipeInfo) => void;
  recipeHistory: Recipe[];
  savedRecipes: Recipe[];
// FIX: Add currentUser to props
  currentUser: User | null;
}

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );

const RecipeItem: React.FC<{recipe: MinimalRecipeInfo, onSelect: () => void}> = ({ recipe, onSelect}) => (
    <li className="border-b border-neutral-200 last:border-b-0">
        <button
            onClick={onSelect}
            className="w-full flex justify-between items-center text-left px-4 py-3 hover:bg-[#E0F2F1] focus-within:bg-[#B2DFDB] transition-colors duration-150 focus:outline-none"
            aria-label={`Select recipe: ${recipe.title}`}
        >
            <div>
                <p className="font-medium text-[#394240] font-['Poppins']">{recipe.title}</p>
                {/* Optionally show timestamp if available and needed */}
                {/* {(recipe as Recipe).timestamp && <p className="text-xs text-[#607D8B] font-['Roboto']">Generated: {new Date((recipe as Recipe).timestamp).toLocaleDateString()}</p>} */}
            </div>
            <ChevronRightIcon className="text-neutral-400 w-5 h-5 flex-shrink-0" />
        </button>
    </li>
);

export const SelectRecipeForCalendarModal: React.FC<SelectRecipeForCalendarModalProps> = ({
  isOpen,
  onClose,
  onRecipeSelect,
  recipeHistory,
  savedRecipes,
// FIX: Destructure currentUser (though not directly used in this component's logic, it's needed for type correctness from App.tsx)
  currentUser, 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeList, setActiveList] = useState<'history' | 'saved'>('history');

  if (!isOpen) return null;

  const lowerSearchTerm = searchTerm.toLowerCase();

  const filteredHistory = recipeHistory.filter(r => r.title.toLowerCase().includes(lowerSearchTerm));
  const filteredSaved = savedRecipes.filter(r => r.title.toLowerCase().includes(lowerSearchTerm));

  const currentList = activeList === 'history' ? filteredHistory : filteredSaved;

  return (
    <div
      className="fixed inset-0 bg-[#394240]/70 flex items-center justify-center z-[1010] p-4 animate-fadeInScale" // Adjusted z-index
      aria-modal="true"
      role="dialog"
      aria-labelledby="select-recipe-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-neutral-200">
          <h2 id="select-recipe-title" className="text-xl font-bold text-[#394240] font-['Poppins'] text-center">
            Select a Recipe for Your Calendar
          </h2>
        </div>

        <div className="p-4">
            <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 mb-3 font-['Roboto']"
            />
             <div className="flex border-b border-neutral-200 mb-2">
                <button
                    onClick={() => setActiveList('history')}
                    className={`flex-1 py-2 text-sm font-medium ${activeList === 'history' ? 'border-b-2 border-[#80CBC4] text-[#80CBC4]' : 'text-neutral-500 hover:text-neutral-700'} font-['Poppins']`}
                >
                    From History ({filteredHistory.length})
                </button>
                <button
                    onClick={() => setActiveList('saved')}
                    className={`flex-1 py-2 text-sm font-medium ${activeList === 'saved' ? 'border-b-2 border-[#80CBC4] text-[#80CBC4]' : 'text-neutral-500 hover:text-neutral-700'} font-['Poppins']`}
                >
                    From Saved ({filteredSaved.length})
                </button>
            </div>
        </div>


        <div className="flex-grow overflow-y-auto px-2 sm:px-4">
          {currentList.length > 0 ? (
            <ul className="bg-white rounded-b-lg overflow-hidden">
              {currentList.map(recipe => (
                <RecipeItem key={recipe.id} recipe={{id: recipe.id, title: recipe.title}} onSelect={() => onRecipeSelect({id: recipe.id, title: recipe.title})} />
              ))}
            </ul>
          ) : (
            <p className="text-center text-neutral-500 py-6 font-['Roboto']">
              No {activeList === 'history' ? 'history' : 'saved'} recipes found{searchTerm ? ' matching your search' : ''}.
            </p>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="w-full bg-neutral-200 hover:bg-neutral-300 text-[#394240] font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins']"
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};