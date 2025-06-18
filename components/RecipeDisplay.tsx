
import React from 'react';
import type { Recipe, ExclusionProps, User, AnonymousGenerationStatus } from '../types'; 

interface RecipeDisplayProps extends ExclusionProps {
  recipe: Recipe;
  onSaveRecipe?: (recipe: Recipe) => void;
  onUnsaveRecipe?: (recipeId: string) => void;
  isRecipeSaved?: boolean;
  onMarkAsCooked?: (recipe: Recipe) => void;
  onUnmarkAsCooked?: (recipeId: string) => void; 
  isRecentlyCooked?: boolean;
  cookedTimestamp?: number;
  onRegenerate?: (originalRecipe: Recipe) => void; 
  onAddToCalendar?: (recipe: Recipe) => void;
  currentUser: User | null;
  anonymousGenerationStatus: AnonymousGenerationStatus;
  onOpenSignUpPromptModal: () => void;
  canGenerate: boolean;
}

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const ListBulletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

const BookmarkIconSolid: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M2 3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1.555.832L10 15.382l-6.445 2.45A1 1 0 0 1 2 17V3Z" clipRule="evenodd" />
  </svg>
);

const BookmarkIconOutline: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
  </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const CalendarPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 12.75h.008v.008H12v-.008ZM12 9.75h.008v.008H12v-.008ZM9.75 12.75h.008v.008H9.75v-.008ZM9.75 9.75h.008v.008H9.75v-.008ZM7.5 12.75h.008v.008H7.5v-.008ZM7.5 9.75h.008v.008H7.5v-.008ZM4.5 12.75h.008v.008H4.5v-.008ZM4.5 9.75h.008v.008H4.5v-.008Zm8.25.75h-1.5V9m-1.5 1.5H9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v3m0 0H9.75m2.25 0H14.25m-2.25-3v-3M12 9.75H9.75M12 9.75H14.25" /> 
  </svg>
);


const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.524M2.25 2.25l19.5 19.5M12 15a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62 3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
  </svg>
);


export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ 
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
  onRegenerate,
  onAddToCalendar,
  currentUser,
  anonymousGenerationStatus,
  onOpenSignUpPromptModal,
  canGenerate
}) => {
  const handleSaveToggle = () => {
    if (!currentUser) {
      onOpenSignUpPromptModal();
      return;
    }
    if (isRecipeSaved && onUnsaveRecipe) {
      onUnsaveRecipe(recipe.id);
    } else if (!isRecipeSaved && onSaveRecipe) {
      onSaveRecipe(recipe);
    }
  };

  const handleCookedToggle = () => {
    if (!currentUser) {
      onOpenSignUpPromptModal();
      return;
    }
    if (isRecentlyCooked && onUnmarkAsCooked) {
      onUnmarkAsCooked(recipe.id);
    } else if (!isRecentlyCooked && onMarkAsCooked) {
      onMarkAsCooked(recipe);
    }
  };

  const handleToggleExclude = () => {
    if (!currentUser) {
        onOpenSignUpPromptModal();
        return;
    }
    onToggleExcludeRecipe(recipe.id);
  }

  const handleAddToCalendarClick = () => {
    if (!currentUser) {
        onOpenSignUpPromptModal();
        return;
    }
    if (onAddToCalendar) onAddToCalendar(recipe);
  }
  
  const handleRegenerateClick = () => {
    if (!canGenerate) {
        onOpenSignUpPromptModal();
        return;
    }
    if (onRegenerate) onRegenerate(recipe);
  }

  const isExcluded = currentUser ? excludedRecipeIds.includes(recipe.id) : false;
  const disableActionsWithoutAuth = !currentUser;


  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-xl animate-fadeIn border border-neutral-200">
      <div className="flex justify-between items-start mb-1">
        <h2 className="text-3xl font-bold text-[#394240] font-['Poppins'] flex-grow mr-4">{recipe.title}</h2>
        <div className="flex items-center gap-2 flex-wrap justify-end flex-shrink-0">
          {onAddToCalendar && (
             <button
                onClick={handleAddToCalendarClick}
                disabled={disableActionsWithoutAuth && !onAddToCalendar} // Disable if no handler or no auth
                className="py-2 px-3 rounded-lg transition-colors duration-150 flex items-center gap-1.5 text-sm font-medium shadow-sm bg-[#B2DFDB] text-[#004D40] hover:bg-[#80CBC4] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
                aria-label="Add this recipe to your meal calendar"
                title={disableActionsWithoutAuth ? "Sign up to add to calendar" : "Add to Meal Calendar"}
            >
                <CalendarPlusIcon />
                Add to Calendar
            </button>
          )}
          {(onMarkAsCooked || onUnmarkAsCooked) && (
            <button
              onClick={handleCookedToggle}
              disabled={disableActionsWithoutAuth && (!onMarkAsCooked || !onUnmarkAsCooked)}
              className={`py-2 px-3 rounded-lg transition-colors duration-150 flex items-center gap-1.5 text-sm font-medium shadow-sm
                ${isRecentlyCooked && currentUser
                  ? 'bg-[#FFE0B2] text-[#E65100] hover:bg-[#FFCC80]' 
                  : 'bg-[#E3F2FD] text-[#0D47A1] hover:bg-[#BBDEFB]'      
                }
                disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed
              `}
              aria-label={isRecentlyCooked ? 'Unmark this recipe as cooked' : 'Mark this recipe as cooked'}
              title={disableActionsWithoutAuth ? "Sign up to mark as cooked" : (isRecentlyCooked ? (cookedTimestamp ? `Unmark as cooked (last cooked ${new Date(cookedTimestamp).toLocaleDateString()})` : 'Unmark as cooked') : 'Mark this recipe as cooked')}
            >
              {isRecentlyCooked && currentUser ? 
                  <XMarkIcon className="w-5 h-5" /> : 
                  <CheckCircleIcon className="w-5 h-5" />
              }
              {isRecentlyCooked && currentUser ? 'Unmark Cooked' : 'Mark Cooked'}
            </button>
          )}
           <button
              onClick={handleToggleExclude}
              disabled={disableActionsWithoutAuth}
              className={`p-2 rounded-full transition-colors duration-150 shadow-sm
                ${isExcluded && currentUser
                  ? 'bg-[#FFCDD2] text-[#C62828] hover:bg-[#EF9A9A]' 
                  : 'bg-neutral-200 text-[#607D8B] hover:bg-neutral-300' 
                }
                 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed
              `}
              aria-label={isExcluded ? 'Include in future suggestions' : 'Exclude from future suggestions'}
              title={disableActionsWithoutAuth ? "Sign up to manage exclusions" : (isExcluded ? 'Include in future suggestions' : 'Exclude from future suggestions')}
            >
              {isExcluded && currentUser ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          {(onSaveRecipe || onUnsaveRecipe) && (
            <button
              onClick={handleSaveToggle}
              disabled={disableActionsWithoutAuth && (!onSaveRecipe || !onUnsaveRecipe)}
              className={`p-2 rounded-full transition-colors duration-150 shadow-sm
                ${isRecipeSaved && currentUser
                  ? 'bg-[#FF8A65] text-white hover:bg-[#F4511E]' 
                  : 'bg-neutral-200 text-[#607D8B] hover:bg-neutral-300' 
                }
                 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed
              `}
              aria-label={isRecipeSaved ? 'Unsave Recipe' : 'Save Recipe'}
              title={disableActionsWithoutAuth ? "Sign up to save recipes" : (isRecipeSaved ? 'Unsave Recipe' : 'Save Recipe')}
            >
              {isRecipeSaved && currentUser ? <BookmarkIconSolid className="w-5 h-5" /> : <BookmarkIconOutline className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
      {isRecentlyCooked && cookedTimestamp && currentUser && (
        <p className="text-xs text-[#00796B] mb-3 flex items-center gap-1 font-['Roboto']">
          <CalendarPlusIcon className="w-4 h-4"/> You last cooked this on {new Date(cookedTimestamp).toLocaleDateString()}.
        </p>
      )}
       {isExcluded && currentUser && (
        <p className="text-xs text-[#FF8A65] mb-3 flex items-center gap-1 font-['Roboto']">
          <EyeSlashIcon className="w-4 h-4"/> Currently excluded from new suggestions.
        </p>
      )}
      <p className="text-[#607D8B] italic mb-6 text-md font-['Roboto']">{recipe.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm text-[#394240] font-['Roboto']">
        <div className="flex flex-col items-center justify-center gap-1 p-3 bg-neutral-50 rounded-lg shadow-md border border-neutral-200">
          <ClockIcon className="text-[#546E7A] w-6 h-6" /> 
          <span className="font-semibold">Prep Time</span>
          <span>{recipe.prepTime}</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 p-3 bg-neutral-50 rounded-lg shadow-md border border-neutral-200">
          <ClockIcon className="text-[#546E7A] w-6 h-6" />
          <span className="font-semibold">Cook Time</span>
          <span>{recipe.cookTime}</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 p-3 bg-neutral-50 rounded-lg shadow-md border border-neutral-200">
          <UsersIcon className="text-[#546E7A] w-6 h-6" />
          <span className="font-semibold">Serves</span>
          <span className="text-center">{recipe.servings}</span>
        </div>
      </div>

      {onRegenerate && (
          <div className="mb-6 text-center">
            <button
                onClick={handleRegenerateClick}
                disabled={!canGenerate && !onRegenerate} // Disable if no handler or cannot generate
                className="bg-[#00796B] hover:bg-[#00695C] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 mx-auto text-sm shadow-md disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed"
                title={!canGenerate ? "Sign up or wait for more generations" : "Generate a new recipe idea using a similar set of ingredients, avoiding this specific recipe."}
            >
                <SparklesIcon /> Try Something Else with These Ingredients
            </button>
          </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-[#394240] mb-4 flex items-center gap-2 font-['Poppins']">
          <ListBulletIcon /> Ingredients
        </h3>
        <ul className="list-none space-y-2 font-['Roboto']">
          {recipe.ingredientsUsed.map((ing, index) => (
            <li key={index} className="p-3 bg-neutral-100 rounded-md shadow-sm text-[#394240] border border-neutral-200">
              <strong className="text-[#004D40]">{ing.name}</strong>: {ing.quantity} {ing.unit}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-[#394240] mb-4 flex items-center gap-2 font-['Poppins']">
          <ListBulletIcon /> Instructions
        </h3>
        <ol className="list-decimal list-outside space-y-4 pl-6 text-[#394240] font-['Roboto']">
          {recipe.instructions.map((step, index) => (
            <li key={index} className="leading-relaxed pb-3 border-b border-neutral-200 last:border-b-0">
              <span className="font-medium text-[#607D8B]">Step {index + 1}:</span> {step}
            </li>
          ))}
        </ol>
      </div>

      {recipe.notes && (
        <div>
          <h3 className="text-2xl font-semibold text-[#394240] mb-3 font-['Poppins']">Chef's Notes & Tips</h3>
          <p className="text-[#607D8B] bg-[#FFFDE7] p-4 rounded-md shadow-sm whitespace-pre-wrap border border-[#FFF9C4] font-['Roboto']">{recipe.notes}</p>
        </div>
      )}
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
