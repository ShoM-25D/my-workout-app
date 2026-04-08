import { Workout } from '@/types/database';
import { AddExerciseModal } from './AddExerciseModal';
import { DeleteWorkoutButton } from './DeleteWorkoutButton';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Weight,
  Activity,
  Plus,
  X,
} from 'lucide-react';

// トレーニング記録の詳細を表示するコンポーネント
type WorkoutDetailProps = {
  workout: Workout;
  onBack: () => void;
  onExerciseDeleted: (id: string) => void;
};

// トレーニング記録の詳細を表示するコンポーネント。日付、時間、種目ごとのセット内容などを見やすく表示する
export function WorkoutDetail({
  workout,
  onBack,
  onExerciseDeleted,
}: WorkoutDetailProps) {
  const router = useRouter();
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  if (!workout) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">トレーニング記録が見つかりません</p>
        <button onClick={onBack} className="mt-4 text-indigo-600">
          戻る
        </button>
      </div>
    );
  }
  // トレーニング全体の総ボリュームを計算する。各セットの重量×回数を合計する
  const totalVolume =
    workout.exercises?.reduce((sum, exercise) => {
      const exerciseVolume =
        exercise.sets?.reduce(
          (setSum, set) => setSum + set.weight * set.reps,
          0,
        ) || 0;
      return sum + exerciseVolume;
    }, 0) || 0;

  const totalSets = workout.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
          <h1 className="text-gray-900">トレーニング詳細</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span>日付</span>
            </div>
            <p className="text-gray-900">{formatDate(workout.date)}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Clock className="w-4 h-4" />
              <span>時間</span>
            </div>
            <p className="text-gray-900">{workout.duration}分</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Activity className="w-4 h-4" />
              <span>総セット数</span>
            </div>
            <p className="text-gray-900">{totalSets}セット</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Weight className="w-4 h-4" />
              <span>総ボリューム</span>
            </div>
            <p className="text-gray-900">{totalVolume.toLocaleString()}kg</p>
          </div>
        </div>

        {/* Body Metrics */}
        {(workout.bodyWeight || workout.bodyFat) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-gray-900 mb-4">体組成</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workout.bodyWeight && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">体重</span>
                  <span className="text-blue-600">{workout.bodyWeight}kg</span>
                </div>
              )}
              {workout.bodyFat && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700">体脂肪率</span>
                  <span className="text-green-600">{workout.bodyFat}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exercises */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 mb-6">実施種目</h2>
            <button
              onClick={() => setIsAddExerciseOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              種目を追加
            </button>
            <DeleteWorkoutButton
              date={workout.date}
              onSuccess={() => {
                router.push(`/workouts/${workout.id}`);
                router.refresh();
              }}
              variant="ghost"
              className="h-8 w-8 rounded-full p-0"
            ></DeleteWorkoutButton>
          </div>
          <div className="space-y-6">
            {workout.exercises.map((exercise, index) => {
              const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));
              const totalReps = exercise.sets.reduce(
                (sum, s) => sum + s.reps,
                0,
              );
              const volume = exercise.sets.reduce(
                (sum, s) => sum + s.weight * s.reps,
                0,
              );

              return (
                <div
                  key={exercise.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full">
                          {index + 1}
                        </span>
                        <h3 className="text-gray-900">{exercise.name}</h3>
                      </div>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full ml-11">
                        {exercise.bodyPart}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">最大重量</p>
                      <p className="text-indigo-600">{maxWeight}kg</p>
                      <p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2"
                          onClick={() => onExerciseDeleted(exercise.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          種目を削除
                        </Button>
                      </p>
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 text-gray-600">
                            セット
                          </th>
                          <th className="text-right py-2 px-4 text-gray-600">
                            重量
                          </th>
                          <th className="text-right py-2 px-4 text-gray-600">
                            回数
                          </th>
                          <th className="text-right py-2 px-4 text-gray-600">
                            ボリューム
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {exercise.sets.map((set, setIndex) => (
                          <React.Fragment key={setIndex}>
                            <tr
                              key={setIndex}
                              className="border-b border-gray-100"
                            >
                              <td className="py-3 px-4 text-gray-700">
                                {setIndex + 1}
                              </td>
                              <td className="text-right py-3 px-4 text-gray-900">
                                {set.weight}kg
                              </td>
                              <td className="text-right py-3 px-4 text-gray-900">
                                {set.reps}回
                              </td>
                              <td className="text-right py-3 px-4 text-gray-700">
                                {(set.weight * set.reps).toLocaleString()}kg
                              </td>
                            </tr>

                            {/* スーパーセット行 */}
                            {set.isSuperset && (
                              <tr
                                key={`${setIndex}-ss`}
                                className="border-b border-indigo-100 bg-indigo-50"
                              >
                                <td className="py-2 px-4 text-indigo-600 text-sm">
                                  SS
                                </td>
                                <td className="text-right py-2 px-4 text-indigo-600 text-sm">
                                  {set.supersetWeight}kg
                                </td>
                                <td className="text-right py-2 px-4 text-indigo-600 text-sm">
                                  {set.supersetReps}回
                                </td>
                                <td className="text-right py-2 px-4 text-indigo-600 text-sm">
                                  {(
                                    (set.supersetWeight ?? 0) *
                                    (set.supersetReps ?? 0)
                                  ).toLocaleString()}
                                  kg
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 text-gray-700">合計</td>
                          <td className="text-right py-3 px-4 text-gray-700">
                            -
                          </td>
                          <td className="text-right py-3 px-4 text-gray-900">
                            {totalReps}回
                          </td>
                          <td className="text-right py-3 px-4 text-indigo-600">
                            {volume.toLocaleString()}kg
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        {workout.notes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">メモ</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{workout.notes}</p>
          </div>
        )}

        {/* モーダルの表示 */}
        {isAddExerciseOpen && (
          <AddExerciseModal
            workoutId={workout.id}
            onClose={() => setIsAddExerciseOpen(false)}
            onAdd={() => {
              setIsAddExerciseOpen(false);
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}
