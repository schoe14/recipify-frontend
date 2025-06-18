
import React from 'react';
import type { Recipe, ExclusionProps, CuisineType, CookedRecipeEntry, User } from '../types'; 

interface RecipeListProps extends ExclusionProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  title: string;
  emptyMessage?: string;
  onAddToCalendar?: (recipe: Recipe) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filterCuisine: CuisineType | 'All';
  onFilterCuisineChange: (cuisine: CuisineType | 'All') => void;
  cuisineOptions: { value: CuisineType | 'All'; label: string }[];
  cookedHistory?: CookedRecipeEntry[]; 
  onRemoveItem?: (recipeId: string) => void;
  onOpenConfirmModal?: (
    title: string, 
    message: string | React.ReactNode, 
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
  currentUser: User | null;
  onOpenSignUpPromptModal: () => void;
}

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
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

const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const TrashIconSmall: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.076M7.908 3.75h4.184c.928 0 1.68.752 1.68 1.68v1.536H6.228V5.43c0-.928.752-1.68 1.68-1.68Z" />
  </svg>
);


export const RecipeList: React.FC<RecipeListProps> = ({ 
    recipes, onSelectRecipe, title, emptyMessage = "No recipes here yet.", 
    excludedRecipeIds, onToggleExcludeRecipe, onAddToCalendar,
    searchTerm, onSearchTermChange, filterCuisine, onFilterCuisineChange, cuisineOptions,
    cookedHistory = [],
    onRemoveItem,
    onOpenConfirmModal,
    currentUser,
    onOpenSignUpPromptModal
}) => {

  const filteredRecipes = React.useMemo(() => {
    return recipes.filter(recipe => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const titleMatch = recipe.title.toLowerCase().includes(lowerSearchTerm);
      const ingredientMatch = recipe.ingredientsUsed.some(ing => ing.name.toLowerCase().includes(lowerSearchTerm));
      const searchMatch = titleMatch || ingredientMatch;

      const cuisineMatch = filterCuisine === 'All' || recipe.cuisine === filterCuisine || (filterCuisine === 'Any' && !recipe.cuisine); 

      return searchMatch && cuisineMatch;
    });
  }, [recipes, searchTerm, filterCuisine]);

  const displayEmptyMessage = searchTerm || filterCuisine !== 'All' 
    ? "No recipes match your current search/filter." 
    : emptyMessage;

  const handleToggleExcludeClick = (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenSignUpPromptModal();
      return;
    }
    onToggleExcludeRecipe(recipeId);
  }

  const handleAddToCalendarClick = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenSignUpPromptModal();
      return;
    }
    if (onAddToCalendar) onAddToCalendar(recipe);
  }
  
  const handleRemoveItemClick = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    if (!currentUser || !onRemoveItem || !onOpenConfirmModal) { // Removal likely tied to user account
      onOpenSignUpPromptModal();
      return;
    }
    onOpenConfirmModal(
        'Confirm Removal',
        <>Are you sure you want to remove "<strong>{recipe.title}</strong>" from this list? This action cannot be undone.</>,
        () => onRemoveItem(recipe.id),
        'Remove',
        'Cancel'
    );
  }


  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#394240] mb-1 font-['Poppins']">{title}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <label htmlFor={`${title.replace(/\s+/g, '-')}-search`} className="block text-sm font-medium text-[#607D8B] mb-1">Search by Name or Ingredient:</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
            </div>
            <input
                type="text"
                id={`${title.replace(/\s+/g, '-')}-search`}
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="e.g., Chicken, Pasta, Spicy..."
                className="w-full p-2 pl-10 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors"
            />
          </div>
        </div>
        <div>
          <label htmlFor={`${title.replace(/\s+/g, '-')}-cuisine-filter`} className="block text-sm font-medium text-[#607D8B] mb-1">Filter by Cuisine:</label>
          <select
            id={`${title.replace(/\s+/g, '-')}-cuisine-filter`}
            value={filterCuisine}
            onChange={(e) => onFilterCuisineChange(e.target.value as CuisineType | 'All')}
            className="w-full p-2.5 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors"
          >
            {cuisineOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[#607D8B] font-['Roboto']">{displayEmptyMessage}</p>
        </div>
      ) : (
        <ul className="bg-white rounded-lg shadow-lg overflow-hidden border border-neutral-200">
          {filteredRecipes.map((recipe) => {
            const isExcluded = currentUser ? excludedRecipeIds.includes(recipe.id) : false;
            const isCooked = currentUser ? cookedHistory.some(entry => entry.recipeId === recipe.id) : false;
            return (
              <li key={recipe.id} className="border-b border-neutral-200 last:border-b-0 group">
                <div className="flex justify-between items-center text-left px-4 py-3 hover:bg-[#E0F2F1] focus-within:bg-[#B2DFDB] transition-colors duration-150">
                  <button
                    onClick={() => onSelectRecipe(recipe)}
                    className="flex-grow text-left focus:outline-none"
                    aria-label={`View recipe: ${recipe.title}`}
                  >
                    <div>
                      <p className={`font-medium font-['Poppins'] ${isExcluded && currentUser ? 'text-[#9E9E9E] line-through' : 'text-[#394240]'}`}>{recipe.title}</p>
                      <p className="text-xs text-[#607D8B] font-['Roboto'] flex items-center gap-2">
                        <span>Generated: {new Date(recipe.timestamp).toLocaleDateString()}</span>
                        {recipe.cuisine && recipe.cuisine !== 'Any' && <span>• {recipe.cuisine}</span>}
                        {isCooked && currentUser && (
                          <span className="bg-[#C8E6C9] text-[#2E7D32] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                            Cooked
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5 sm:gap-2 ml-2">
                    {onRemoveItem && onOpenConfirmModal && (
                       <button
                          onClick={(e) => handleRemoveItemClick(e, recipe)}
                          disabled={!currentUser}
                          className="p-1.5 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors disabled:text-neutral-400 disabled:hover:bg-transparent"
                          title={!currentUser ? "Sign in to remove" : "Remove from History"}
                          aria-label={`Remove ${recipe.title} from history`}
                      >
                          <TrashIconSmall />
                      </button>
                    )}
                    {onAddToCalendar && (
                       <button
                          onClick={(e) => handleAddToCalendarClick(e, recipe)}
                          disabled={!currentUser}
                          className="p-1.5 rounded-full text-[#00796B] hover:bg-[#B2DFDB] hover:text-[#004D40] transition-colors disabled:text-neutral-400 disabled:hover:bg-transparent"
                          title={!currentUser ? "Sign in to add to calendar" : "Add to Meal Calendar"}
                          aria-label={`Add ${recipe.title} to meal calendar`}
                      >
                          <CalendarPlusIcon />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleToggleExcludeClick(e, recipe.id)}
                      disabled={!currentUser}
                      className={`p-1.5 rounded-full hover:bg-neutral-200 transition-colors 
                                  ${isExcluded && currentUser ? 'text-[#FF8A65] hover:text-[#E65100]' : 'text-[#607D8B] hover:text-[#394240]'}
                                  disabled:text-neutral-400 disabled:hover:bg-transparent`}
                      title={!currentUser ? "Sign in to manage exclusions" : (isExcluded ? "Include in future suggestions" : "Exclude from future suggestions")}
                      aria-label={isExcluded ? `Include ${recipe.title} in suggestions` : `Exclude ${recipe.title} from suggestions`}
                    >
                      {isExcluded && currentUser ? <EyeIcon /> : <EyeSlashIcon />}
                    </button>
                    <ChevronRightIcon className="text-neutral-400 w-6 h-6" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
