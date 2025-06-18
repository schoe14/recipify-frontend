
import React, { useState, useEffect } from 'react';
import type { CalendarEntry, MealSlotType, User, StandardMealSlotType } from '../types';
import { STANDARD_MEAL_SLOTS, OTHER_SLOT_KEY } from '../types';

interface EditCalendarEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: CalendarEntry;
  onUpdateEntry: (entryId: string, updates: { newDate?: string; newSlot?: MealSlotType; newCustomSlotName?: string }) => { success: boolean; message?: string };
  onRemoveEntry: (entryId: string) => void;
  onViewRecipeDetails: (recipeId: string) => void; // Expects recipeId now
  currentUser: User | null; // Though modal is opened only if currentUser, keep for consistency
  onShowUpgradeModal: (featureName: string, limitDetails: string, premiumBenefit: string) => void;
}

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.24.03 3.22.076M7.908 3.75h4.184c.928 0 1.68.752 1.68 1.68v1.536H6.228V5.43c0-.928.752-1.68 1.68-1.68Z" />
  </svg>
);

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);


export const EditCalendarEntryModal: React.FC<EditCalendarEntryModalProps> = ({
  isOpen,
  onClose,
  entry,
  onUpdateEntry,
  onRemoveEntry,
  onViewRecipeDetails,
  currentUser,
  onShowUpgradeModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(entry.date);
  const [selectedSlotKey, setSelectedSlotKey] = useState<MealSlotType | typeof OTHER_SLOT_KEY>(
    STANDARD_MEAL_SLOTS.some(s => s.name === entry.slot) ? entry.slot as StandardMealSlotType : OTHER_SLOT_KEY
  );
  const [customSlotName, setCustomSlotName] = useState<string>(
    STANDARD_MEAL_SLOTS.some(s => s.name === entry.slot) ? '' : entry.slot
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && entry) {
      setSelectedDate(entry.date);
      const isStandard = STANDARD_MEAL_SLOTS.some(s => s.name === entry.slot);
      setSelectedSlotKey(isStandard ? entry.slot as StandardMealSlotType : OTHER_SLOT_KEY);
      setCustomSlotName(isStandard ? '' : entry.slot);
      setError(null);
    }
  }, [isOpen, entry]);

  if (!isOpen || !currentUser) return null; // Should be gated by App.tsx

  const handleSubmit = () => {
    setError(null);
    let finalSlot: MealSlotType = selectedSlotKey as StandardMealSlotType;
    let finalCustomSlotName: string | undefined = undefined;

    if (selectedSlotKey === OTHER_SLOT_KEY) {
      if (!currentUser?.isPaid) {
        onShowUpgradeModal("Custom Meal Slots", "Creating custom meal slots is a Recipify Pro feature.", "Upgrade to Pro!");
        setError("Custom slots are a premium feature.");
        return;
      }
      if (!customSlotName.trim()) {
        setError("Custom slot name cannot be empty.");
        return;
      }
      finalSlot = customSlotName.trim();
      finalCustomSlotName = customSlotName.trim();
    }

    const result = onUpdateEntry(entry.id, { newDate: selectedDate, newSlot: finalSlot, newCustomSlotName: finalCustomSlotName });
    if (!result.success && result.message) {
      setError(result.message);
    }
  };
  
  const handleViewDetailsClick = () => {
    onViewRecipeDetails(entry.recipeId);
    // No need to onClose here, RecipeDetailModal will overlay.
  };


  return (
    <div
      className="fixed inset-0 bg-[#394240]/70 flex items-center justify-center z-[1010] p-4" // Ensure this z-index is correct relative to others
      aria-modal="true"
      role="dialog"
      aria-labelledby="edit-calendar-entry-title"
    >
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-fadeInScale">
        <div className="text-center mb-6">
          <EditIcon className="w-10 h-10 text-[#80CBC4] mx-auto mb-3" />
          <h2 id="edit-calendar-entry-title" className="text-xl sm:text-2xl font-bold text-[#394240] font-['Poppins']">
            Edit Meal Entry
          </h2>
          <p className="text-sm text-[#607D8B] font-['Roboto']">Modify details for "{entry.recipeTitle}".</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div>
            <label htmlFor="edit-calendar-date" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">
              Date:
            </label>
            <input
              type="date"
              id="edit-calendar-date"
              value={selectedDate}
              onChange={(e) => {setSelectedDate(e.target.value); setError(null);}}
              className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 font-['Roboto']"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-meal-slot" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">
              Meal Slot:
            </label>
            <select
              id="edit-meal-slot"
              value={selectedSlotKey}
              onChange={(e) => {
                setSelectedSlotKey(e.target.value as MealSlotType | typeof OTHER_SLOT_KEY);
                if (e.target.value !== OTHER_SLOT_KEY) setCustomSlotName('');
                setError(null);
              }}
              className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 font-['Roboto']"
            >
              {STANDARD_MEAL_SLOTS.map(slotDef => (
                <option key={slotDef.name} value={slotDef.name}>{slotDef.displayName}</option>
              ))}
              {currentUser?.isPaid && <option value={OTHER_SLOT_KEY}>Other (Custom)...</option>}
            </select>
          </div>

          {selectedSlotKey === OTHER_SLOT_KEY && currentUser?.isPaid && (
            <div>
              <label htmlFor="edit-custom-meal-slot-name" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">
                Custom Slot Name:
              </label>
              <input
                type="text"
                id="edit-custom-meal-slot-name"
                value={customSlotName}
                onChange={(e) => {setCustomSlotName(e.target.value); setError(null);}}
                placeholder="e.g., Brunch, Post-Workout"
                className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 font-['Roboto']"
                maxLength={50}
              />
            </div>
          )}
          
          {error && <p className="text-xs text-center text-[#FF8A65] bg-[#FFF0E6] p-2 rounded-md font-['Roboto']">{error}</p>}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              className="w-full bg-[#9CCC65] hover:bg-[#8BC34A] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins'] shadow-sm"
            >
              Save Changes
            </button>
             <button
                type="button"
                onClick={handleViewDetailsClick}
                className="w-full flex items-center justify-center gap-2 bg-sky-100 hover:bg-sky-200 text-sky-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins']"
            >
                <EyeIcon className="w-5 h-5" /> View Recipe Details
            </button>
            <button
              type="button"
              onClick={() => onRemoveEntry(entry.id)}
              className="w-full flex items-center justify-center gap-2 bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins']"
            >
              <TrashIcon className="w-5 h-5" /> Remove from Calendar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-neutral-200 hover:bg-neutral-300 text-[#394240] font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins']"
            >
              Cancel
            </button>
          </div>
        </form>
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
    </div>
  );
};
