
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { IngredientDataItem, BatchAddMessage, AnimationType, User, AnonymousGenerationStatus } from '../types';
import { startSpeechRecognition } from '../services/speechService'; 

interface MyKitchenProps {
  allIngredients: IngredientDataItem[];
  myKitchenIngredients: IngredientDataItem[];
  onAddToMyKitchen: (ingredient: IngredientDataItem) => void;
  onRemoveFromMyKitchen: (ingredientId: string) => void;
  maxIngredients: number; 
  disabled?: boolean;
  onSurpriseMe: () => Promise<void>;
  isLoading: boolean; 
  // apiKeyMissingError: boolean; // REMOVED
  recentlyAddedIngredients?: IngredientDataItem[]; 
  onBatchAdd: (ingredientNames: string[]) => void; 
  batchAddMessage: BatchAddMessage; 
  clearBatchAddMessage: () => void; 
  setBatchAddMessage: (message: BatchAddMessage) => void; 
  animationType: AnimationType;
  currentUser: User | null;
  anonymousGenerationStatus: AnonymousGenerationStatus;
  onOpenSignUpPromptModal: () => void;
  canGenerate: boolean;
}

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-11.707a1 1 0 0 0-1.414-1.414L10 8.586 7.707 6.293a1 1 0 0 0-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 1 0 1.414 1.414L10 11.414l2.293 2.293a1 1 0 0 0 1.414-1.414L11.414 10l2.293-2.293Z" clipRule="evenodd" />
  </svg>
);

const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.355a7.5 7.5 0 0 1-3.75 0M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 16.5v-2.25m0 0a2.25 2.25 0 0 0 0-4.5m0 4.5a2.25 2.25 0 0 1 0-4.5M12 6.75A2.25 2.25 0 0 1 14.25 9v1.079a2.25 2.25 0 0 1-.879 1.716l-.005.004a2.25 2.25 0 0 0-.879 1.716V15M14.25 9A2.25 2.25 0 0 0 12 6.75M9.75 9A2.25 2.25 0 0 1 12 6.75M12 3a2.25 2.25 0 0 0-2.25 2.25M12 18a2.25 2.25 0 0 0 2.25-2.25M9.75 15.079a2.25 2.25 0 0 1 .879-1.716l.005-.004a2.25 2.25 0 0 0 .879-1.716V9A2.25 2.25 0 0 0 9.75 9Z" />
    </svg>
);

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c.665 0 1.295-.14 1.885-.401m-3.77 0A11.934 11.934 0 0 1 12 15Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5c0-2.486 2.015-4.5 4.5-4.5s4.5 2.014 4.5 4.5v4.5c0 2.486-2.015 4.5-4.5 4.5s-4.5-2.014-4.5-4.5V10.5Z" />
    </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4" {...props} >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const QuickAddChip: React.FC<{ingredient: IngredientDataItem, onSelect: (ing: IngredientDataItem) => void, disabled?: boolean, title: string}> = ({ ingredient, onSelect, disabled, title }) => ( 
    <button
      type="button"
      onClick={() => onSelect(ingredient)}
      disabled={disabled}
      className="flex items-center gap-1 bg-[#E0F2F1] text-[#00796B] text-xs font-medium px-2.5 py-1 rounded-full hover:bg-[#B2DFDB] disabled:bg-neutral-200 disabled:text-neutral-500 transition-colors"
      title={title}
    >
      <PlusIcon />
      {ingredient.name}
    </button>
);


export const MyKitchen: React.FC<MyKitchenProps> = ({
  allIngredients,
  myKitchenIngredients,
  onAddToMyKitchen,
  onRemoveFromMyKitchen,
  maxIngredients, 
  disabled, // General disable for loading etc.
  onSurpriseMe,
  isLoading,
  // apiKeyMissingError, // REMOVED
  recentlyAddedIngredients = [],
  onBatchAdd,
  batchAddMessage,
  clearBatchAddMessage,
  setBatchAddMessage,
  animationType,
  currentUser,
  anonymousGenerationStatus,
  onOpenSignUpPromptModal,
  canGenerate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const authDisabled = !currentUser; // True if user is not signed in

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(lowerSearchTerm) &&
      !myKitchenIngredients.find(selected => selected.id === ingredient.id)
    ).slice(0, 10);
  }, [searchTerm, allIngredients, myKitchenIngredients]);

  const handleSelect = (ingredient: IngredientDataItem) => {
    if (authDisabled) {
      onOpenSignUpPromptModal();
      return;
    }
    if (myKitchenIngredients.length < maxIngredients) {
      onAddToMyKitchen(ingredient);
      setSearchTerm('');
      setShowSuggestions(false);
      clearBatchAddMessage();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (stopRecognitionRef.current) { stopRecognitionRef.current(); }
    };
  }, [wrapperRef]);

  const atMaxIngredients = myKitchenIngredients.length >= maxIngredients; // This maxIngredients is usually Infinity for MyKitchen

  const handleBatchInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (authDisabled) {
      onOpenSignUpPromptModal();
      return;
    }
    setBatchInput(e.target.value);
    if (batchAddMessage) clearBatchAddMessage();
  };

  const handleProcessBatchAdd = () => {
    if (authDisabled) {
      onOpenSignUpPromptModal();
      return;
    }
    if (!batchInput.trim()) return;
    const names = batchInput.split(',').map(name => name.trim()).filter(name => name);
    onBatchAdd(names); // onBatchAdd in App.tsx will handle the auth check for the actual add function
    setBatchInput('');
  };

  const handleVoiceInput = () => {
    if (authDisabled) {
      onOpenSignUpPromptModal();
      return;
    }
    if (isListening) {
      if (stopRecognitionRef.current) stopRecognitionRef.current();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    clearBatchAddMessage();
    const stop = startSpeechRecognition(
      (transcript) => {
        setBatchInput(prev => prev ? `${prev}, ${transcript}` : transcript);
        setIsListening(false);
      },
      (errorMsg) => {
        console.error("Speech recognition error:", errorMsg);
        setBatchAddMessage({type: 'error', text: `Speech error: ${errorMsg}`});
        setIsListening(false);
      },
      () => setIsListening(false)
    );
    if(stop) stopRecognitionRef.current = stop;
    else setIsListening(false);
  };
  
  const handleSurpriseMeClick = () => {
      if (!canGenerate && !currentUser) { // Specifically for anonymous users who have used their one try
          onOpenSignUpPromptModal();
          return;
      }
      if (!canGenerate && currentUser) { // For signed-in users who hit their limit
          // UpgradeModal will be triggered by handleGenerateRecipeWithOptions
      }
      onSurpriseMe();
  }

  const quickAddableRecentlyAdded = recentlyAddedIngredients.filter(
    (recentIng) => !myKitchenIngredients.some((kitchenIng) => kitchenIng.id === recentIng.id)
  );

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#394240] mb-2 font-['Poppins']">My Kitchen Ingredients</h2>
            <p className="text-[#607D8B] font-['Roboto']">
              {currentUser 
                ? "Manage the ingredients you currently have. Use \"Surprise Me!\" for recipe ideas!"
                : "Sign up to manage your kitchen ingredients and get personalized recipe ideas!" 
              }
            </p>
        </div>
      
      {currentUser && quickAddableRecentlyAdded.length > 0 && !atMaxIngredients && (
        <div className="pb-2">
          <h5 className="text-xs font-medium text-[#607D8B] mb-1.5 font-['Poppins']">Quick Add (Recently Added to Kitchen):</h5>
          <div className="flex flex-wrap gap-2">
            {quickAddableRecentlyAdded.slice(0, 7).map(ing => (
              <QuickAddChip 
                key={ing.id} 
                ingredient={ing} 
                onSelect={handleSelect} 
                disabled={disabled || atMaxIngredients} 
                title={`Quick add ${ing.name} to kitchen`}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={wrapperRef} className="space-y-4">
        <div>
          <label htmlFor="mykitchen-ingredient-search" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">
            Add Ingredients to Your Kitchen:
          </label>
          <div className="relative">
            <input
              type="text"
              id="mykitchen-ingredient-search"
              value={searchTerm}
              onChange={(e) => { 
                if (authDisabled) { onOpenSignUpPromptModal(); return; }
                setSearchTerm(e.target.value); setShowSuggestions(true); if (batchAddMessage) clearBatchAddMessage(); 
              }}
              onFocus={() => {
                if (authDisabled) { onOpenSignUpPromptModal(); return; }
                setShowSuggestions(filteredSuggestions.length > 0);
              }}
              placeholder={authDisabled ? "Sign in to manage your kitchen" : (atMaxIngredients ? "Your kitchen is full (max reached)" : "Type to find ingredients...")}
              disabled={disabled || authDisabled || atMaxIngredients}
              className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
              aria-autocomplete="list"
              aria-expanded={showSuggestions && filteredSuggestions.length > 0}
              aria-controls="mykitchen-ingredient-suggestions"
            />
            {showSuggestions && filteredSuggestions.length > 0 && !authDisabled && (
              <ul 
                id="mykitchen-ingredient-suggestions"
                className="absolute z-20 w-full bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
                role="listbox"
              >
                {filteredSuggestions.map(ingredient => (
                  <li key={ingredient.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => handleSelect(ingredient)}
                      className="w-full text-left px-4 py-2 hover:bg-[#E0F2F1] text-[#394240] focus:bg-[#B2DFDB] outline-none flex items-center justify-between font-['Roboto']"
                    >
                      <span>
                        {ingredient.name} 
                        <span className="text-xs text-[#607D8B] ml-2">({ingredient.category})</span>
                      </span>
                      <PlusCircleIcon className="text-[#80CBC4] w-5 h-5 flex-shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {atMaxIngredients && myKitchenIngredients.length > 0 && maxIngredients !== Infinity && currentUser && (
            <p className="text-xs text-[#FF8A65] mt-1 font-['Roboto']">
              You've reached the maximum of {maxIngredients} ingredients for your kitchen.
            </p>
          )}
        </div>

        <div className="pt-2">
          <label htmlFor="mykitchen-batch-ingredient-input" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">
            Batch Add to Kitchen (comma-separated or dictate):
          </label>
          <div className="flex gap-2">
            <textarea
              id="mykitchen-batch-ingredient-input"
              rows={2}
              value={batchInput}
              onChange={handleBatchInputChange}
              placeholder={authDisabled ? "Sign in to use batch add" : "e.g., Onion, Carrot, Chicken Breast"}
              disabled={disabled || authDisabled || atMaxIngredients}
              className="w-full p-2 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 disabled:bg-neutral-100 disabled:text-neutral-500 font-['Roboto']"
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={disabled || authDisabled || atMaxIngredients}
              className={`p-2.5 border border-neutral-300 rounded-lg shadow-sm h-full flex items-center justify-center
                          ${isListening ? 'bg-[#FF8A65] hover:bg-[#F4511E] text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-[#394240]'}
                          disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors`}
              title={authDisabled ? "Sign in to use voice input" : (isListening ? "Stop Listening" : "Dictate Ingredients for Kitchen")}
              aria-label={isListening ? "Stop voice input" : "Start voice input for kitchen ingredients"}
            >
              <MicrophoneIcon className={isListening ? "animate-pulse" : ""} />
            </button>
          </div>
           <button
            type="button"
            onClick={handleProcessBatchAdd}
            disabled={disabled || authDisabled || atMaxIngredients || !batchInput.trim()}
            className="mt-2 w-full bg-[#9CCC65] hover:bg-[#8BC34A] disabled:bg-[#BDBDBD] text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#9CCC65] focus:ring-offset-2 text-sm shadow-sm font-['Poppins']"
          >
            Add from List to Kitchen
          </button>
          {batchAddMessage && (
            <p className={`text-xs mt-1.5 p-1.5 rounded font-['Roboto'] ${
              batchAddMessage.type === 'success' ? 'bg-[#E0F2F1] text-[#00695C]' : 
              batchAddMessage.type === 'error' ? 'bg-[#FFEBEE] text-[#C62828]' : 
              'bg-[#E3F2FD] text-[#1565C0]'
            }`}>
              {batchAddMessage.text}
            </p>
          )}
        </div>


        {myKitchenIngredients.length === 0 && currentUser && (
            <p className="text-[#607D8B] text-center py-4 font-['Roboto']">Your kitchen is currently empty. Add some ingredients you have on hand!</p>
        )}
        {!currentUser && (
             <p className="text-[#607D8B] text-center py-4 font-['Roboto']">
                <button onClick={onOpenSignUpPromptModal} className="text-[#80CBC4] hover:underline font-semibold">Sign up</button> to save ingredients to your kitchen.
            </p>
        )}


        {myKitchenIngredients.length > 0 && currentUser && (
          <div>
            <h4 className="text-lg font-semibold text-[#394240] mb-3 font-['Poppins']">Currently in Your Kitchen ({myKitchenIngredients.length}):</h4>
            <div className="flex flex-wrap gap-2">
              {myKitchenIngredients.map(ingredient => (
                <span 
                  key={ingredient.id} 
                  className="flex items-center gap-1.5 bg-[#E0F2F1] text-[#00796B] text-sm font-medium pl-3 pr-2 py-1.5 rounded-full shadow-sm font-['Roboto']"
                  aria-label={`Kitchen ingredient: ${ingredient.name}`}
                >
                  {ingredient.name}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => {
                        if (authDisabled) { onOpenSignUpPromptModal(); return; }
                        onRemoveFromMyKitchen(ingredient.id);
                      }}
                      className="text-[#004D40] hover:text-[#00695C] focus:outline-none focus:ring-1 focus:ring-[#00796B] rounded-full"
                      aria-label={`Remove ${ingredient.name} from kitchen`}
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <button
          onClick={handleSurpriseMeClick}
          disabled={isLoading /* REMOVED apiKeyMissingError */ || myKitchenIngredients.length === 0 || !canGenerate}
          className="w-full flex items-center justify-center gap-2 bg-[#FF8A65] hover:bg-[#F4511E] disabled:bg-[#BDBDBD] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#FF8A65] focus:ring-offset-2 text-md shadow-md font-['Poppins']"
          aria-label="Generate a surprise recipe using ingredients from My Kitchen"
        >
          <LightBulbIcon />
          {isLoading && animationType === 'surprising' ? 'Conjuring...' : isLoading ? 'Thinking...' : 'Surprise Me!'}
        </button>
        {(myKitchenIngredients.length === 0 || (authDisabled && myKitchenIngredients.length > 0) ) && (
          <p className="text-xs text-[#607D8B] mt-1 text-center font-['Roboto']">
            {authDisabled ? "Sign up to use ingredients from your kitchen!" : "Add ingredients to your kitchen to use \"Surprise Me!\"."}
          </p>
        )}
         {!canGenerate && !currentUser && myKitchenIngredients.length > 0 && (
             <p className="text-xs text-[#FF8A65] mt-1 text-center">You've used your free generation! <button onClick={onOpenSignUpPromptModal} className="underline font-semibold">Sign up</button> for more.</p>
         )}
      </div>
    </div>
  );
};
