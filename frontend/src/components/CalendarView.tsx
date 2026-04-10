import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Workout } from '@/types/database';

type CalendarViewProps = {
  workouts: Workout[];
  onDateClick: (date: string) => void;
};

export function CalendarView({ workouts, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const workoutDates = new Set(
    workouts.map((w) => new Date(w.date).toDateString()),
  );

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const workoutNotes = new Map(
    workouts
      .filter((w) => w.notes)
      .map((w) => [new Date(w.date).toDateString(), w.notes]),
  );

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-gray-900">
          {year}年 {month + 1}月
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="text-center text-gray-600 py-2">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const date = new Date(year, month, day);
          const dateString = date.toDateString();
          const hasWorkout = workoutDates.has(dateString);
          const isToday = date.toDateString() === new Date().toDateString();
          const notes = workoutNotes.get(dateString);

          return (
            <button
              key={day}
              disabled={!hasWorkout}
              onClick={() => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                hasWorkout && onDateClick(dateStr);
              }}
              className={`aspect-square flex items-center justify-center rounded-lg border ${
                hasWorkout
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700 cursor-pointer hover:opacity-80'
                  : 'border-gray-200 text-gray-700 cursor-default'
              } ${isToday ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <div className="relative group flex flex-col items-center">
                {day}
                {notes && (
                  <>
                    <span className="text-xs">📝</span>
                    <div className="absolute bottom-full hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded w-32 z-10">
                      {notes}
                    </div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-100 border border-indigo-300 rounded" />
          <span className="text-gray-600">トレーニング実施日</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 rounded" />
          <span className="text-gray-600">今日</span>
        </div>
      </div>
    </div>
  );
}
