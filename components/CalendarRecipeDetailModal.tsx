
import React from 'react';
import type { Recipe, ExclusionProps, User, AnonymousGenerationStatus } from '../types';
import { RecipeDisplay } from './RecipeDisplay'; 

interface CalendarRecipeDetailModalProps extends ExclusionProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  onSaveRecipe: (recipe: Recipe) => void;
  onUnsaveRecipe: (recipeId: string) => void;
  isRecipeSaved: boolean;
  onMarkAsCooked: (recipe: Recipe) => void;
  onUnmarkAsCooked: (recipeId: string) => void;
  isRecentlyCooked: boolean;
  cookedTimestamp?: number;
  onRegenerate?: (originalRecipe: Recipe) => void;
  onAddToCalendar: (recipeInfo: Recipe) => void;
  currentUser: User | null;
  anonymousGenerationStatus: AnonymousGenerationStatus;
  onOpenSignUpPromptModal: () => void;
  canGenerate: boolean;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const CalendarRecipeDetailModal: React.FC<CalendarRecipeDetailModalProps> = ({
  isOpen,
  onClose,
  recipe,
  onSaveRecipe,
  onUnsaveRecipe,
  isRecipeSaved,
  onMarkAsCooked,
  onUnmarkAsCooked,
  isRecentlyCooked,
  cookedTimestamp,
  excludedRecipeIds,
  onToggleExcludeRecipe,
  onRegenerate, // Prop received
  onAddToCalendar,
  currentUser,
  anonymousGenerationStatus,
  onOpenSignUpPromptModal, // Prop received
  canGenerate // Prop received
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#394240]/80 flex items-center justify-center z-[1010] p-4 animate-fadeInScale" 
      aria-modal="true"
      role="dialog"
      aria-labelledby="calendar-recipe-detail-title"
    >
      <div className="bg-[#FAFAFA] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-neutral-200">
          <h2 id="calendar-recipe-detail-title" className="text-lg font-semibold text-[#394240] font-['Poppins'] truncate">
            Recipe: {recipe.title}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100"
            aria-label="Close recipe details"
          >
            <XMarkIcon />
          </button>
        </div>

        <div className="overflow-y-auto p-2 sm:p-4"> 
          <RecipeDisplay
            recipe={recipe}
            onSaveRecipe={onSaveRecipe}
            onUnsaveRecipe={onUnsaveRecipe}
            isRecipeSaved={isRecipeSaved}
            onMarkAsCooked={onMarkAsCooked}
            onUnmarkAsCooked={onUnmarkAsCooked}
            isRecentlyCooked={isRecentlyCooked}
            cookedTimestamp={cookedTimestamp}
            excludedRecipeIds={excludedRecipeIds}
            onToggleExcludeRecipe={onToggleExcludeRecipe}
            onRegenerate={onRegenerate} // Pass regenerate if available
            onAddToCalendar={onAddToCalendar}
            currentUser={currentUser}
            anonymousGenerationStatus={anonymousGenerationStatus}
            onOpenSignUpPromptModal={onOpenSignUpPromptModal} // Pass down
            canGenerate={canGenerate} // Pass down
          />
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
