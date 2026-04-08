import { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Workout, Exercise } from '@/types/database';
import { fetchWithAuth } from '@/lib/api';

type AddWorkoutModalProps = {
  onClose: () => void;
  onAdd: (workout: Workout) => void;
  onExistingWorkout: (workoutId: string) => void;
};

const bodyParts = ['胸', '背中', '脚', '肩', '腕', '腹筋'];
const commonExercises: Record<string, string[]> = {
  胸: [
    'ベンチプレス',
    'ダンベルプレス',
    'インクラインプレス',
    'チェストフライ',
  ],
  背中: ['デッドリフト', 'ラットプルダウン', 'ベントオーバーロー', '懸垂'],
  脚: ['スクワット', 'レッグプレス', 'レッグカール', 'レッグエクステンション'],
  肩: ['ショルダープレス', 'サイドレイズ', 'フロントレイズ', 'リアレイズ'],
  腕: [
    'バーベルカール',
    'トライセプスエクステンション',
    'ハンマーカール',
    'ディップス',
  ],
  腹筋: ['クランチ', 'レッグレイズ', 'プランク', 'アブローラー'],
};

// トレーニング記録を追加するモーダルコンポーネント
export function AddWorkoutModal({
  onClose,
  onAdd,
  onExistingWorkout,
}: AddWorkoutModalProps) {
  const [apiExercises, setApiExercises] = useState<
    { id: number; name: string; target_muscle: string }[]
  >([]);

  useEffect(() => {
    fetchWithAuth('http://localhost:8000/exercises')
      .then((r) => r.json())
      .then((data) => setApiExercises(data))
      .catch(() => {});
  }, []);

  // 日付の状態を管理（初期値は今日の日付）
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  // トレーニングの時間、種目、メモ、体重、体脂肪率などの状態を管理
  const [duration, setDuration] = useState(60);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [existingWorkout, setExistingWorkout] = useState<{
    id: string;
    date: string;
  } | null>(null);
  const [addMode, setAddMode] = useState<'new' | 'existing' | null>(null);

  // 種目の選択とカスタム種目の入力を管理する状態
  const [selectedBodyPart, setSelectedBodyPart] = useState('胸');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [isCustomExercise, setIsCustomExercise] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!date) return;
    setExistingWorkout(null);

    fetchWithAuth(`http://localhost:8000/workouts/by-date/${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          setExistingWorkout(data);
        } else {
          setIsChecking(false);
        }
      })
      .catch(() => {});
  }, [date]);

  // 種目を追加する関数
  const addExercise = () => {
    // 選択された種目名を取得（カスタム種目の場合はカスタム種目名を使用）
    const exerciseName = isCustomExercise
      ? customExerciseName
      : selectedExercise;
    if (!exerciseName || exerciseName.trim() === '') return;

    // 新しい種目オブジェクトを作成し、既存の種目リストに追加
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName.trim(),
      bodyPart: selectedBodyPart,
      sets: [
        {
          weight: 0,
          reps: 0,
          isSuperset: false,
          supersetExerciseName: '',
          supersetWeight: 0,
          supersetReps: 0,
        },
      ],
    };

    setExercises([...exercises, newExercise]);
    setSelectedExercise('');
    setCustomExerciseName('');
    setIsCustomExercise(false);
  };

  // 種目を削除する関数
  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  // セットの重量や回数を更新する関数
  const updateSet = (
    exerciseId: string,
    setIndex: number,
    field: 'weight' | 'reps' | 'isSuperset' | 'supersetWeight' | 'supersetReps',
    value: number | boolean,
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

  // セットを追加する関数
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

  // セットを削除する関数（ただし、最低1セットは残す）
  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId && exercise.sets.length > 1) {
          return {
            ...exercise,
            sets: exercise.sets.filter((_, i) => i !== setIndex),
          };
        }
        return exercise;
      }),
    );
  };

  // フォームの送信処理。入力されたデータをまとめて新しいトレーニング記録オブジェクトを作成し、onAddコールバックに渡す
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const exercisesData = exercises.map((ex) => ({
        name: ex.name,
        body_part: ex.bodyPart,
        sets: ex.sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
          is_superset: set.isSuperset ?? false,
          superset_weight: set.supersetWeight ?? null,
          superset_reps: set.supersetReps ?? null,
        })),
      }));

      if (addMode === 'existing' && existingWorkout) {
        const response = await fetchWithAuth(
          `http://localhost:8000/workouts/${existingWorkout.id}/add-exercises`,
          {
            method: 'POST',
            body: JSON.stringify({ exercises: exercisesData }),
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || '保存に失敗しました。');
        }
        onClose();
        return;
      }

      // 新規作成
      const workoutData = {
        date: date,
        duration: duration,
        notes: notes || null,
        body_weight: bodyWeight ? parseFloat(bodyWeight) : null,
        body_fat: bodyFat ? parseFloat(bodyFat) : null,
        exercises: exercisesData,
      };

      const response = await fetchWithAuth('http://localhost:8000/workouts', {
        method: 'POST',
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '保存に失敗しました。');
      }

      const savedWorkout = await response.json();

      alert('保存に成功しました！');
      onAdd(savedWorkout);
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      console.error('保存に失敗しました:', message);
      alert(`保存に失敗しました: ${message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-gray-900">トレーニング記録を追加</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">日付</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          {existingWorkout ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 mb-3">
                {date}にすでにトレーニング記録があります。
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExistingWorkout(existingWorkout.id);
                }}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                詳細画面で編集する
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-gray-700 mb-2">時間（分）</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                  min="1"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">体重（kg）</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyWeight}
                    onChange={(e) => setBodyWeight(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="任意"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    体脂肪率（%）
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="任意"
                  />
                </div>
              </div>

              {/* Add Exercise */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-gray-900 mb-4">種目を追加</h3>
                <div className="space-y-4">
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
                          if (value !== 'custom') {
                            setCustomExerciseName('');
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">選択してください</option>
                        {(apiExercises.filter(
                          (ex) => ex.target_muscle === selectedBodyPart,
                        ).length > 0
                          ? apiExercises
                              .filter(
                                (ex) => ex.target_muscle === selectedBodyPart,
                              )
                              .map((ex) => ex.name)
                          : commonExercises[selectedBodyPart]
                        ).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                        <option value="custom">カスタム種目を入力</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addExercise}
                        disabled={
                          !selectedExercise ||
                          (isCustomExercise && !customExerciseName.trim())
                        }
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        追加
                      </button>
                    </div>
                  </div>

                  {/* Custom Exercise Input */}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Exercises List */}
              {exercises.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-gray-900">実施種目</h3>
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

                      <div className="space-y-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="space-y-2">
                            <div className="flex items-center gap-2">
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
                              <span className="text-gray-600">kg</span>
                              <input
                                type="number"
                                value={set.reps || ''}
                                onChange={(e) =>
                                  updateSet(
                                    exercise.id,
                                    setIndex,
                                    'reps',
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                placeholder="回数"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              />
                              <span className="text-gray-600">回</span>
                              {/* スーパーセットトグル */}
                              <button
                                type="button"
                                onClick={() =>
                                  updateSet(
                                    exercise.id,
                                    setIndex,
                                    'isSuperset',
                                    !set.isSuperset,
                                  )
                                }
                                className={`px-2 py-1 rounded text-sm ${
                                  set.isSuperset
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                SS
                              </button>
                              {exercise.sets.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSet(exercise.id, setIndex)
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {/* スーパーセット入力欄 */}
                            {set.isSuperset && (
                              <div className="flex items-center gap-2 ml-16 bg-indigo-50 p-2 rounded-lg">
                                <span className="text-indigo-600 text-sm">
                                  SS:
                                </span>
                                <input
                                  type="number"
                                  value={set.supersetWeight || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      exercise.id,
                                      setIndex,
                                      'supersetWeight',
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  placeholder="重量"
                                  className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg"
                                />
                                <span className="text-gray-600">kg</span>
                                <input
                                  type="number"
                                  value={set.supersetReps || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      exercise.id,
                                      setIndex,
                                      'supersetReps',
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  placeholder="回数"
                                  className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg"
                                />
                                <span className="text-gray-600">回</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addSet(exercise.id)}
                        className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        セットを追加
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-gray-700 mb-2">メモ</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="今日の調子、気づいたことなど..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={exercises.length === 0}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  記録を保存
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
