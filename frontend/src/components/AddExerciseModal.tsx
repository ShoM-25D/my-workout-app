'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Exercise } from '@/types/database';
import { fetchWithAuth, API_BASE_URL } from '@/lib/api';
import { bodyParts, commonExercises } from '@/lib/constants';
import { toast } from 'sonner';

type AddExerciseModalProps = {
  workoutId: string;
  onClose: () => void;
  onAdd: () => void;
};

export function AddExerciseModal({
  workoutId,
  onClose,
  onAdd,
}: AddExerciseModalProps) {
  const [apiExercises, setApiExercises] = useState<
    { id: number; name: string; target_muscle: string }[]
  >([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState('胸');
  const [selectedExercise, setSelectedExercise] = useState(' ');
  const [customExerciseName, setCustomExerciseName] = useState(' ');
  const [isCustomExercise, setIsCustomExercise] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchWithAuth(`${API_BASE_URL}/exercises`)
      .then((r) => r.json())
      .then((data) => setApiExercises(data))
      .catch(() => {});
  }, []);

  const addExercise = () => {
    const exerciseName = isCustomExercise
      ? customExerciseName
      : selectedExercise;
    if (!exerciseName || exerciseName.trim() === '') return;
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName.trim(),
      bodyPart: selectedBodyPart,
      sets: [{ weight: 0, reps: 0 }],
    };

    setExercises([...exercises, newExercise]);
    setSelectedExercise('');
    setCustomExerciseName('');
    setIsCustomExercise(false);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const updateSet = (
    exerciseId: string,
    setIndex: number,
    field: 'weight' | 'reps',
    value: number,
  ) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          const newSets = [...exercise.sets];
          newSets[setIndex] = { ...newSets[setIndex], [field]: value };
          return { ...exercise, sets: newSets };
        }
        return exercise;
      }),
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: [...exercise.sets, { weight: 0, reps: 0 }],
          };
        }
        return exercise;
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetchWithAuth(
        `${API_BASE_URL}/workouts/${workoutId}/add-exercises`,
        {
          method: 'POST',
          body: JSON.stringify({
            exercises: exercises.map((ex) => ({
              name: ex.name,
              body_part: ex.bodyPart,
              sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
            })),
          }),
        },
      );

      onAdd();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      toast.error(`保存に失敗しました:${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const exercisesForPart = () => {
    const fromApi = apiExercises
      .filter((e) => e.target_muscle === selectedBodyPart)
      .map((e) => e.name);
    return fromApi.length > 0
      ? fromApi
      : (commonExercises[selectedBodyPart] ?? []);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-gray-900">種目を追加</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">部位</label>
                <select
                  value={selectedBodyPart}
                  onChange={(e) => {
                    setSelectedBodyPart(e.target.value);
                    setSelectedExercise('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {bodyParts.map((part) => (
                    <option key={part} value={part}>
                      {part}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">種目</label>
                <select
                  value={selectedExercise}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedExercise(value);
                    setIsCustomExercise(value === 'custom');
                    if (value !== 'custom') setCustomExerciseName('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">選択して下さい</option>
                  {exercisesForPart().map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="custom">カスタム種目を入力</option>
                </select>
              </div>
              {isCustomExercise && (
                <div>
                  <label className="block text-gray-700 mb-2">
                    カスタム種目名
                  </label>
                  <input
                    type="text"
                    value={customExerciseName}
                    onChange={(e) => setCustomExerciseName(e.target.value)}
                    placeholder="例: スミスマシンスクワット"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={addExercise}
                disabled={
                  !selectedExercise ||
                  (isCustomExercise && !customExerciseName.trim())
                }
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>
          </div>
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-gray-900">{exercise.name}</h4>
                  <p className="text-gray-600">({exercise.bodyPart})</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeExercise(exercise.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center gap-2 mb-2">
                  <span className="text-gray-600 w-16">
                    {setIndex + 1}セット
                  </span>
                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={(e) =>
                      updateSet(
                        exercise.id,
                        setIndex,
                        'weight',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="重量"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-600 ">kg</span>
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) =>
                      updateSet(
                        exercise.id,
                        setIndex,
                        'reps',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="回数"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-600">回</span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSet(exercise.id)}
                className="mt-2 text-indigo-600 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                セットを追加
              </button>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={exercises.length === 0 || isSaving}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
