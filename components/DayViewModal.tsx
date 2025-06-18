
import React, { useState, useMemo } from 'react';
import type { CalendarEntry, MealSlotType, User, MinimalRecipeInfo, StandardMealSlotType } from '../types';
import { STANDARD_MEAL_SLOTS, getSlotDisplayInfo } from '../types';

interface DayViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  entries: CalendarEntry[];
  currentUser: User | null;
  onRequestAddEntryToSlot: (date: string, slot?: MealSlotType) => void; 
  onOpenEditCalendar: (entry: CalendarEntry) => void;
  onViewCalendarRecipeDetail: (recipeId: string) => void; 
  onMoveEntry: (entryId: string, newDate: string, newSlot: MealSlotType) => void;
  onShowUpgradeModal: (featureName: string, limitDetails: string, premiumBenefit: string) => void;
  onOpenSignUpPromptModal: () => void; 
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const DayViewModal: React.FC<DayViewModalProps> = ({
  isOpen, onClose, date, entries, currentUser,
  onRequestAddEntryToSlot, onOpenEditCalendar, onViewCalendarRecipeDetail, 
  onMoveEntry, onShowUpgradeModal, onOpenSignUpPromptModal
}) => {
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<MealSlotType | null>(null);

  const formattedDate = useMemo(() => {
    const d = new Date(date + 'T00:00:00'); 
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [date]);

  if (!isOpen) return null;

  const handleDragStart = (event: React.DragEvent<HTMLLIElement>, entryId: string) => {
    if (!currentUser) {
        onOpenSignUpPromptModal();
        event.preventDefault(); // Prevent drag if not signed in
        return;
    }
    setDraggingItemId(entryId);
    event.dataTransfer.setData("text/plain", entryId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingItemId(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, slot: MealSlotType) => {
    event.preventDefault();
    if (!currentUser) { 
        event.dataTransfer.dropEffect = "none";
        return;
    }
    if (draggingItemId) {
        const entryBeingDragged = entries.find(e => e.id === draggingItemId);
        if(entryBeingDragged?.slot === slot && entries.filter(e=>e.slot === slot).length === 1 && !currentUser?.isPaid){
             event.dataTransfer.dropEffect = "none";
        } else {
            event.dataTransfer.dropEffect = "move";
        }
    } else {
         event.dataTransfer.dropEffect = "none";
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>, slot: MealSlotType) => {
    event.preventDefault();
     if (!currentUser) return;
    setDragOverSlot(slot);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetSlot: MealSlotType) => {
    event.preventDefault();
    if (!currentUser) {
        onOpenSignUpPromptModal();
        return;
    }
    const draggedEntryId = event.dataTransfer.getData("text/plain");
    if (draggedEntryId && draggingItemId === draggedEntryId) {
        if(!currentUser?.isPaid && !STANDARD_MEAL_SLOTS.some(sds => sds.name === targetSlot)){
            onShowUpgradeModal("Custom Meal Slots", "Moving to custom meal slots is a premium feature.", "Upgrade to Pro!");
        } else {
            onMoveEntry(draggedEntryId, date, targetSlot);
        }
    }
    setDraggingItemId(null);
    setDragOverSlot(null);
  };
  
  const handleRequestAddEntry = (slotName?: MealSlotType) => {
      if (!currentUser) {
          onOpenSignUpPromptModal();
          return;
      }
      onRequestAddEntryToSlot(date, slotName);
  }

  const handleOpenEdit = (entry: CalendarEntry) => {
      if(!currentUser) {
          onOpenSignUpPromptModal();
          return;
      }
      onOpenEditCalendar(entry);
  }
  
  const handleViewDetails = (recipeId: string) => {
      onViewCalendarRecipeDetail(recipeId);
  }


  const groupedEntries = useMemo(() => {
    const group: Record<MealSlotType, CalendarEntry[]> = {};
    STANDARD_MEAL_SLOTS.forEach(slotDef => group[slotDef.name] = []);

    entries.forEach(entry => {
      if (!group[entry.slot]) {
        group[entry.slot] = [];
      }
      group[entry.slot].push(entry);
    });
    for (const slot in group) {
        group[slot].sort((a,b) => (a.orderInSlot || a.timestamp) - (b.orderInSlot || b.timestamp));
    }
    return group;
  }, [entries]);

  const displayedSlots = [...STANDARD_MEAL_SLOTS.map(s => s.name), ...Object.keys(groupedEntries).filter(slot => !STANDARD_MEAL_SLOTS.some(sds => sds.name === slot))];

  return (
    <div className="fixed inset-0 bg-[#394240]/70 flex items-center justify-center z-[1000] p-4 animate-fadeInScale"
         aria-modal="true" role="dialog" aria-labelledby="day-view-title">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-neutral-200">
          <h2 id="day-view-title" className="text-xl sm:text-2xl font-bold text-[#394240] font-['Poppins'] text-center">
            {formattedDate}
          </h2>
        </div>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
          {displayedSlots.map(slotName => {
            const slotEntries = groupedEntries[slotName] || [];
            const slotInfo = getSlotDisplayInfo(slotName);
            const isSlotActiveDropZone = dragOverSlot === slotName && currentUser; 

            return (
              <div
                key={slotName}
                className={`p-3 rounded-lg border-2 ${isSlotActiveDropZone ? 'border-dashed border-[#FF8A65]' : slotInfo.borderColor} ${isSlotActiveDropZone ? 'bg-orange-50' : 'bg-white'} shadow-sm transition-all`}
                onDragOver={(e) => handleDragOver(e, slotName)}
                onDragEnter={(e) => handleDragEnter(e, slotName)}
                onDrop={(e) => handleDrop(e, slotName)}
              >
                <h3 className={`text-lg font-semibold ${slotInfo.textColor} mb-2 font-['Poppins'] flex justify-between items-center`}>
                  {slotInfo.displayName}
                  {(slotEntries.length === 0 || currentUser?.isPaid) && (
                    <button
                        onClick={() => handleRequestAddEntry(slotName)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                        title={`Add to ${slotInfo.displayName}`}
                    >
                       <PlusIcon className="w-3 h-3"/> Add
                    </button>
                  )}
                </h3>
                {slotEntries.length > 0 ? (
                  <ul className="space-y-2">
                    {slotEntries.map(entry => (
                      <li
                        key={entry.id}
                        id={`entry-${entry.id}`}
                        className={`p-1.5 rounded-md flex items-center justify-between ${currentUser ? 'cursor-grab hover:shadow-md' : 'cursor-default'} transition-shadow
                                    ${draggingItemId === entry.id && currentUser
                                        ? 'opacity-50 ring-2 ring-[#FF8A65] bg-neutral-100' 
                                        : `${getSlotDisplayInfo(entry.slot).textColor.replace('text-', 'bg-').replace('-800', '-100')} opacity-100`
                                    }
                                  `}
                        draggable={!!currentUser} // Only draggable if logged in
                        onDragStart={(e) => handleDragStart(e, entry.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOpenEdit(entry)}
                        title={currentUser ? `Drag to reorder, Click to edit: ${entry.recipeTitle}` : `View: ${entry.recipeTitle}`}
                      >
                        <span className={`font-medium truncate ${getSlotDisplayInfo(entry.slot).textColor} flex-grow mr-2`}>{entry.recipeTitle}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleViewDetails(entry.recipeId); }} 
                            className="text-xs text-sky-600 hover:text-sky-800 underline flex-shrink-0"
                            title="View full recipe details"
                        >
                            Details
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500 font-['Roboto'] italic">No meals planned for {slotInfo.displayName.toLowerCase()}.</p>
                )}
              </div>
            );
          })}
           <button
            onClick={() => handleRequestAddEntry(undefined)} 
            className="mt-4 w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 border border-neutral-300"
            title="Add another meal to this day"
            >
                <PlusIcon /> Add Meal to this Day
            </button>
        </div>

        <div className="p-4 sm:p-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="w-full bg-neutral-200 hover:bg-neutral-300 text-[#394240] font-medium py-2.5 px-4 rounded-lg transition-colors duration-150 font-['Poppins']"
          >
            Close
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
