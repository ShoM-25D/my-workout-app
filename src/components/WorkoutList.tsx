import { useState } from 'react';
import { Workout } from '@/mocks/mockWorkouts';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

// トレーニング記録のリストを表示するコンポーネント。日付、時間、種目ごとのセット内容を一覧で表示し、クリックで詳細に遷移できるようにする
type WorkoutListProps = {
  workouts: Workout[];
  onViewWorkout: (workout: Workout) => void;
};

// 1ページあたりの表示件数を定義
const ITEMS_PER_PAGE = 5;

// トレーニング記録のリストを表示するコンポーネント。日付、時間、種目ごとのセット内容を一覧で表示し、クリックで詳細に遷移できるようにする
export function WorkoutList({ workouts, onViewWorkout }: WorkoutListProps) {
  // 現在のページを管理する状態。初期値は1ページ目
  const [currentPage, setCurrentPage] = useState(1);

  // ページネーションのために、総ページ数を計算し、現在のページに表示するトレーニング記録のスライスを作成する
  const totalPages = Math.ceil(workouts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentWorkouts = workouts.slice(startIndex, endIndex);

  // 日付を日本語表記にフォーマットする関数。toLocaleDateStringを使って年月日と曜日を表示する
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <div>
      <div className="space-y-4">
        {currentWorkouts.map((workout) => (
          <div
            key={workout.id}
            onClick={() => onViewWorkout(workout)}
            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(workout.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{workout.duration}分</span>
              </div>
            </div>

            <div className="space-y-2">
              {workout.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                >
                  <div>
                    <span className="text-gray-900">{exercise.name}</span>
                    <span className="text-gray-500 ml-2">
                      ({exercise.bodyPart})
                    </span>
                  </div>
                  <span className="text-gray-600">
                    {exercise.sets.length}セット
                  </span>
                </div>
              ))}
            </div>

            {workout.notes && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-600">{workout.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
            前へ
          </button>

          <span className="text-gray-600">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            次へ
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
