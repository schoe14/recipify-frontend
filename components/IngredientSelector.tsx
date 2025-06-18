
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { IngredientDataItem, BatchAddMessage, User, AnonymousGenerationStatus } from '../types';
import { startSpeechRecognition } from '../services/speechService'; 

interface IngredientSelectorProps {
  allIngredients: IngredientDataItem[];
  selectedIngredients: IngredientDataItem[];
  onSelectIngredient: (ingredient: IngredientDataItem) => void;
  onRemoveIngredient: (ingredientId: string) => void;
  maxIngredients: number;
  disabled?: boolean;
  recentlyUsedIngredients?: IngredientDataItem[]; 
  onBatchAdd: (ingredientNames: string[]) => void; 
  batchAddMessage: BatchAddMessage; 
  clearBatchAddMessage: () => void; 
  setBatchAddMessage: (message: BatchAddMessage) => void; 
  currentUser: User | null; // Added
  anonymousGenerationStatus: AnonymousGenerationStatus; // Added
}

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-11.707a1 1 0 0 0-1.414-1.414L10 8.586 7.707 6.293a1 1 0 0 0-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 1 0 1.414 1.414L10 11.414l2.293 2.293a1 1 0 0 0 1.414-1.414L11.414 10l2.293-2.293Z" clipRule="evenodd" />
  </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4" {...props} >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c.665 0 1.295-.14 1.885-.401m-3.77 0A11.934 11.934 0 0 1 12 15Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10.5c0-2.486 2.015-4.5 4.5-4.5s4.5 2.014 4.5 4.5v4.5c0 2.486-2.015 4.5-4.5 4.5s-4.5-2.014-4.5-4.5V10.5Z" />
    </svg>
);

const QuickAddChip: React.FC<{ingredient: IngredientDataItem, onSelect: (ing: IngredientDataItem) => void, disabled?: boolean}> = ({ ingredient, onSelect, disabled }) => (
    <button
      type="button"
      onClick={() => onSelect(ingredient)}
      disabled={disabled}
      className="flex items-center gap-1 bg-[#E0F2F1] text-[#00796B] text-xs font-medium px-2.5 py-1 rounded-full hover:bg-[#B2DFDB] disabled:bg-neutral-200 disabled:text-neutral-500 transition-colors" /* Light Mint BG, Darker Teal text */
      title={`Quick add ${ingredient.name}`}
    >
      <PlusIcon />
      {ingredient.name}
    </button>
);


export const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  allIngredients,
  selectedIngredients,
  onSelectIngredient,
  onRemoveIngredient,
  maxIngredients,
  disabled,
  recentlyUsedIngredients = [],
  onBatchAdd,
  batchAddMessage,
  clearBatchAddMessage,
  setBatchAddMessage,
  currentUser, // Prop received
  anonymousGenerationStatus // Prop received
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(lowerSearchTerm) &&
      !selectedIngredients.find(selected => selected.id === ingredient.id)
    ).slice(0, 10);
  }, [searchTerm, allIngredients, selectedIngredients]);

  const handleSelect = (ingredient: IngredientDataItem) => {
    if (selectedIngredients.length < maxIngredients) {
      onSelectIngredient(ingredient);
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
      if (stopRecognitionRef.current) { 
        stopRecognitionRef.current();
      }
    };
  }, [wrapperRef]);

  const atMaxIngredients = selectedIngredients.length >= maxIngredients;

  const handleBatchInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBatchInput(e.target.value);
    if (batchAddMessage) clearBatchAddMessage();
  };

  const handleProcessBatchAdd = () => {
    if (!batchInput.trim()) return;
    const names = batchInput.split(',').map(name => name.trim()).filter(name => name);
    onBatchAdd(names);
    setBatchInput('');
  };
  
  const handleVoiceInput = () => {
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

  const quickAddableRecentlyUsed = recentlyUsedIngredients.filter(
    (recentIng) => !selectedIngredients.some((selIng) => selIng.id === recentIng.id)
  );

  return (
    <div className="space-y-4">
      {quickAddableRecentlyUsed.length > 0 && !atMaxIngredients && (
        <div className="pb-2">
          <h5 className="text-xs font-medium text-[#607D8B] mb-1.5">Quick Add (Last Used):</h5> {/* Slate Gray */}
          <div className="flex flex-wrap gap-2">
            {quickAddableRecentlyUsed.slice(0, 7).map(ing => (
              <QuickAddChip key={ing.id} ingredient={ing} onSelect={handleSelect} disabled={disabled || atMaxIngredients && !selectedIngredients.includes(ing)} />
            ))}
          </div>
        </div>
      )}

      <div ref={wrapperRef}>
        <label htmlFor="ingredient-search" className="block text-sm font-medium text-[#394240] mb-1"> {/* Deep Blueberry */}
          Search & Add Ingredients (up to {maxIngredients}):
        </label>
        <div className="relative">
          <input
            type="text"
            id="ingredient-search"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); if (batchAddMessage) clearBatchAddMessage(); }}
            onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
            placeholder={atMaxIngredients ? "Max ingredients reached" : "Type to find ingredients..."}
            disabled={disabled || atMaxIngredients}
            className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed" /* Mint Fresh focus */
            aria-autocomplete="list"
            aria-expanded={showSuggestions && filteredSuggestions.length > 0}
            aria-controls="ingredient-suggestions"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul 
              id="ingredient-suggestions"
              className="absolute z-20 w-full bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
              role="listbox"
            >
              {filteredSuggestions.map(ingredient => (
                <li key={ingredient.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => handleSelect(ingredient)}
                    className="w-full text-left px-4 py-2 hover:bg-[#E0F2F1] text-[#394240] focus:bg-[#B2DFDB] outline-none" /* Light Mint hover, Deep Blueberry text */
                  >
                    {ingredient.name} 
                    <span className="text-xs text-[#607D8B] ml-2">({ingredient.category})</span> {/* Slate Gray */}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {atMaxIngredients && selectedIngredients.length > 0 && (
          <p className="text-xs text-[#FF8A65] mt-1"> {/* Soft Coral for error */}
            You've reached the maximum of {maxIngredients} ingredients. Remove some to add others.
          </p>
        )}
      </div>

      <div className="pt-2">
        <label htmlFor="batch-ingredient-input" className="block text-sm font-medium text-[#394240] mb-1"> {/* Deep Blueberry */}
          Batch Add (comma-separated list or dictate):
        </label>
        <div className="flex gap-2">
          <textarea
            id="batch-ingredient-input"
            rows={2}
            value={batchInput}
            onChange={handleBatchInputChange}
            placeholder="e.g., Onion, Carrot, Chicken Breast"
            disabled={disabled || atMaxIngredients}
            className="w-full p-2 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 disabled:bg-neutral-100 disabled:text-neutral-500" /* Mint Fresh focus */
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={disabled || atMaxIngredients}
            className={`p-2.5 border border-neutral-300 rounded-lg shadow-sm h-full flex items-center justify-center
                        ${isListening ? 'bg-[#FF8A65] hover:bg-[#F4511E] text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-[#394240]'} /* Soft Coral when listening */
                        disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors`}
            title={isListening ? "Stop Listening" : "Dictate Ingredients"}
            aria-label={isListening ? "Stop voice input" : "Start voice input for ingredients"}
          >
            <MicrophoneIcon className={isListening ? "animate-pulse" : ""} />
          </button>
        </div>
        <button
          type="button"
          onClick={handleProcessBatchAdd}
          disabled={disabled || atMaxIngredients || !batchInput.trim()}
          className="mt-2 w-full bg-[#9CCC65] hover:bg-[#8BC34A] disabled:bg-[#BDBDBD] text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#9CCC65] focus:ring-offset-2 text-sm shadow-sm"
        >
          Add from List
        </button>
        {batchAddMessage && (
          <p className={`text-xs mt-1.5 p-1.5 rounded ${
            batchAddMessage.type === 'success' ? 'bg-[#E0F2F1] text-[#00695C]' : // Light Mint BG, Darker Teal text
            batchAddMessage.type === 'error' ? 'bg-[#FFEBEE] text-[#C62828]' : // Light Soft Coral BG, Dark Red text
            'bg-[#E3F2FD] text-[#1565C0]' // Light Blue BG, Dark Blue text
          }`}>
            {batchAddMessage.text}
          </p>
        )}
      </div>

      {selectedIngredients.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-[#394240] mb-2">Selected Ingredients ({selectedIngredients.length}/{maxIngredients}):</h4> {/* Deep Blueberry */}
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map(ingredient => (
              <span 
                key={ingredient.id} 
                className="flex items-center gap-1.5 bg-[#C8E6C9] text-[#2E7D32] text-sm font-medium px-3 py-1.5 rounded-full shadow-sm" /* Light Green Tea BG, Darker Green Tea Text */
                aria-label={`Selected ingredient: ${ingredient.name}`}
              >
                {ingredient.name}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemoveIngredient(ingredient.id)}
                    className="text-[#1B5E20] hover:text-[#2E7D32] focus:outline-none focus:ring-1 focus:ring-[#A5D6A7] rounded-full" /* Darkest Green Tea text, Darker Green Tea hover */
                    aria-label={`Remove ${ingredient.name}`}
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
       <p className="mt-2 text-xs text-[#607D8B]"> {/* Slate Gray */}
        Type to search or use batch add. Categories are shown for clarity.
      </p>
    </div>
  );
};
