
import React, { useState, useEffect } from 'react';
import type { Recipe, MealSlotType, User, StandardMealSlotType, MinimalRecipeInfo } from '../types';
import { STANDARD_MEAL_SLOTS, OTHER_SLOT_KEY } from '../types';

interface AddToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: MinimalRecipeInfo;
  onAddEntry: (recipe: MinimalRecipeInfo, date: string, slot: MealSlotType, customSlotName?: string) => void;
  currentUser: User | null; // Though modal is opened only if currentUser, keep for consistency
  onShowUpgradeModal: (featureName: string, limitDetails: string, premiumBenefit: string) => void;
  prefillDate?: string;
  prefillSlot?: MealSlotType;
}

const CalendarPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008ZM12 12.75h.008v.008H12v-.008ZM12 9.75h.008v.008H12v-.008ZM9.75 12.75h.008v.008H9.75v-.008ZM9.75 9.75h.008v.008H9.75v-.008ZM7.5 12.75h.008v.008H7.5v-.008ZM7.5 9.75h.008v.008H7.5v-.008ZM4.5 12.75h.008v.008H4.5v-.008ZM4.5 9.75h.008v.008H4.5v-.008Zm8.25.75h-1.5V9m-1.5 1.5H9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v3m0 0H9.75m2.25 0H14.25m-2.25-3v-3M12 9.75H9.75M12 9.75H14.25" />
  </svg>
);

export const AddToCalendarModal: React.FC<AddToCalendarModalProps> = ({
  isOpen,
  onClose,
  recipe,
  onAddEntry,
  currentUser,
  onShowUpgradeModal,
  prefillDate,
  prefillSlot,
}) => {
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState<string>(prefillDate || todayDateString);
  const [selectedSlotKey, setSelectedSlotKey] = useState<MealSlotType | typeof OTHER_SLOT_KEY>('Dinner');
  const [customSlotName, setCustomSlotName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !currentUser) return; // Modal should not open if !currentUser

    setSelectedDate(prefillDate || todayDateString);
    setError(null);

    if (prefillSlot !== undefined) {
        const isStandard = STANDARD_MEAL_SLOTS.some(s => s.name === prefillSlot);
        if (isStandard) {
            setSelectedSlotKey(prefillSlot as StandardMealSlotType);
            setCustomSlotName('');
        } else if (currentUser?.isPaid) { 
            setSelectedSlotKey(OTHER_SLOT_KEY);
            setCustomSlotName(prefillSlot !== OTHER_SLOT_KEY ? prefillSlot : '');
        } else { 
            setSelectedSlotKey('Dinner'); 
            setCustomSlotName('');
        }
    } else { 
        setSelectedSlotKey(currentUser?.isPaid ? OTHER_SLOT_KEY : 'Dinner');
        setCustomSlotName('');
    }
  }, [isOpen, prefillDate, prefillSlot, currentUser, todayDateString]);


  if (!isOpen || !currentUser) return null; // Gated by App.tsx

  const handleSubmit = () => {
    setError(null);
    const chosenDate = new Date(selectedDate + 'T00:00:00'); 
    const todayMidnight = new Date(todayDateString + 'T00:00:00');

    let finalSlot: MealSlotType = selectedSlotKey as StandardMealSlotType;
    let finalCustomSlotName: string | undefined = undefined;

    if (selectedSlotKey === OTHER_SLOT_KEY) {
      if (!currentUser?.isPaid) { // This check remains for direct use of modal if somehow bypassed
        onShowUpgradeModal("Custom Meal Slots", "Creating custom meal slots is a Recipify Pro feature.", "Upgrade to Pro to organize your meals with custom slot names!");
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
    
    if (!currentUser?.isPaid && chosenDate.getTime() > todayMidnight.getTime()) {
      onShowUpgradeModal("Future Meal Planning", "Free users can only log meals for today or past dates.", "Plan your meals ahead with Recipify Pro!");
      setError("Free users cannot log meals for future dates. Upgrade to Pro!");
      return;
    }
    onAddEntry(recipe, selectedDate, finalSlot, finalCustomSlotName);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    if (error) setError(null); 
  };

  const handleSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSlotKey(e.target.value as MealSlotType | typeof OTHER_SLOT_KEY);
    if (e.target.value !== OTHER_SLOT_KEY) {
      setCustomSlotName(''); 
    }
    if (error) setError(null);
  };
  
  const handleCustomSlotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSlotName(e.target.value);
    if (error) setError(null);
  }

  return (
    <div
      className="fixed inset-0 bg-[#394240]/70 flex items-center justify-center z-[1020]"
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-to-calendar-title"
    >
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-fadeInScale">
        <div className="text-center mb-6">
          <CalendarPlusIcon className="w-10 h-10 text-[#80CBC4] mx-auto mb-3" />
          <h2 id="add-to-calendar-title" className="text-xl sm:text-2xl font-bold text-[#394240] font-['Poppins']">
            Add to Meal Calendar
          </h2>
          <p className="text-sm text-[#607D8B] font-['Roboto']">Log "{recipe.title}" to a specific date and mealtime.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div>
            <label htmlFor="calendar-date" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">
              Date:
            </label>
            <input
              type="date"
              id="calendar-date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 font-['Roboto']"
              required
            />
          </div>

          <div>
            <label htmlFor="meal-slot" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">
              Meal Slot:
            </label>
            <select
              id="meal-slot"
              value={selectedSlotKey}
              onChange={handleSlotChange}
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
              <label htmlFor="custom-meal-slot-name" className="block text-sm font-medium text-[#394240] mb-1 font-['Poppins']">
                Custom Slot Name:
              </label>
              <input
                type="text"
                id="custom-meal-slot-name"
                value={customSlotName}
                onChange={handleCustomSlotNameChange}
                placeholder="e.g., Brunch, Post-Workout"
                className="w-full p-3 border border-neutral-300 bg-white rounded-lg shadow-sm focus:ring-[#80CBC4] focus:border-[#80CBC4] transition-colors duration-150 font-['Roboto']"
                maxLength={50}
              />
            </div>
          )}
          
          {error && <p className="text-xs text-center text-[#FF8A65] bg-[#FFF0E6] p-2 rounded-md font-['Roboto']">{error}</p>}


          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-grow bg-[#9CCC65] hover:bg-[#8BC34A] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins'] shadow-sm"
            >
              Add to Calendar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-grow bg-neutral-200 hover:bg-neutral-300 text-[#394240] font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins']"
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
