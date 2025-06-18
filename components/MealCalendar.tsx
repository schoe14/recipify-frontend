
import React, { useState, useMemo } from 'react';
import type { CalendarEntry, MealSlotType, User, StandardMealSlotType } from '../types';
import { FREE_TIER_CALENDAR_VIEW_DAYS, STANDARD_MEAL_SLOTS, CUSTOM_SLOT_DISPLAY_INFO } from '../types';

interface MealCalendarProps {
  entries: CalendarEntry[];
  onSelectDay: (date: string) => void; // Changed from onSelectEntry
  currentUser: User | null;
  onShowUpgradeModal: (featureName: string, limitDetails: string, premiumBenefit: string) => void;
}

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const MealCalendar: React.FC<MealCalendarProps> = ({
  entries,
  onSelectDay,
  currentUser,
  onShowUpgradeModal,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); 

  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const firstDayOfMonth = daysInMonth[0].getDay(); 

  const freeTierPastDateLimit = useMemo(() => {
    const limit = new Date();
    limit.setDate(limit.getDate() - FREE_TIER_CALENDAR_VIEW_DAYS);
    limit.setHours(0, 0, 0, 0);
    return limit;
  }, []);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    if (!currentUser?.isPaid) {
        const firstOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        if (firstOfNewMonth < freeTierPastDateLimit) {
            onShowUpgradeModal(
                "Viewing Full Meal History",
                `Free users can view meals from the last ${FREE_TIER_CALENDAR_VIEW_DAYS} days.`,
                "See your entire meal history with Recipify Pro!"
            );
        }
    }
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-neutral-100 text-[#394240] transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeftIcon />
        </button>
        <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#394240] font-['Poppins']">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={handleToday} className="text-xs text-[#00796B] hover:underline font-['Roboto']">Go to Today</button>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-neutral-100 text-[#394240] transition-colors"
          aria-label="Next month"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px border border-neutral-200 bg-neutral-200">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center py-2 font-medium text-xs sm:text-sm text-[#394240] bg-neutral-50 font-['Poppins']">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-neutral-50 min-h-[80px] sm:min-h-[100px]"></div>
        ))}

        {daysInMonth.map(day => {
          const dateString = day.toISOString().split('T')[0];
          const dayEntries = entries.filter(entry => entry.date === dateString);
          const isPastLimitForFree = !currentUser?.isPaid && day < freeTierPastDateLimit;
          const isToday = dateString === new Date().toISOString().split('T')[0];
          
          const dayCellClasses = `p-1.5 min-h-[80px] sm:min-h-[100px] flex flex-col relative cursor-pointer hover:bg-neutral-50 transition-colors
            ${isToday ? 'bg-mint-50 border-2 border-[#80CBC4]' : 'bg-white'} 
            ${isPastLimitForFree ? 'day-cell-disabled !cursor-not-allowed' : ''}`;

          const occupiedStandardSlots = STANDARD_MEAL_SLOTS.filter(slotDef => 
            dayEntries.some(entry => entry.slot === slotDef.name)
          );
          const hasCustomEntries = dayEntries.some(entry => 
            !STANDARD_MEAL_SLOTS.some(sds => sds.name === entry.slot)
          );

          return (
            <div 
              key={dateString} 
              className={dayCellClasses}
              onClick={() => !isPastLimitForFree && onSelectDay(dateString)}
              role="button"
              tabIndex={isPastLimitForFree ? -1 : 0}
              aria-label={`View meals for ${day.toLocaleDateString()}`}
            >
              <span className={`font-medium text-xs sm:text-sm text-right self-end pr-1 ${isToday ? 'text-[#00796B] font-bold' : 'text-neutral-600'}`}>
                {day.getDate()}
              </span>
              {isPastLimitForFree ? (
                <div className="text-center text-[10px] sm:text-xs text-neutral-400 mt-2 flex-grow flex items-center justify-center">
                  History
                  <br />
                  unavailable
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1 justify-center items-start flex-grow">
                  {occupiedStandardSlots.map(slotDef => (
                    <span key={slotDef.name} title={slotDef.displayName} className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${slotDef.color} shadow-sm`}></span>
                  ))}
                  {hasCustomEntries && (
                    <span title="Custom Meal" className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${CUSTOM_SLOT_DISPLAY_INFO.color} shadow-sm`}></span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500 mt-4 text-center font-['Roboto']">
        Click on a day to view, add, or edit meals.
      </p>
    </div>
  );
};
