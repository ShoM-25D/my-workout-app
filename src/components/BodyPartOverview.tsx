import { Workout } from '../src/app/page';
import { Activity } from 'lucide-react';

// 部位別トレーニング種目の概要を表示するコンポーネント
type BodyPartOverviewProps = {
  workouts: Workout[];
};

// 部位ごとに色を定義
const bodyPartColors: Record<string, string> = {
  胸: 'bg-red-100 text-red-700 border-red-200',
  背中: 'bg-blue-100 text-blue-700 border-blue-200',
  脚: 'bg-green-100 text-green-700 border-green-200',
  肩: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  腕: 'bg-purple-100 text-purple-700 border-purple-200',
  腹筋: 'bg-pink-100 text-pink-700 border-pink-200',
};

// トレーニング記録から部位別の種目数と種目名を集計し、表示するコンポーネント
export function BodyPartOverview({ workouts }: BodyPartOverviewProps) {
  // 部位ごとに種目名のセットを保持するマップを作成
  const bodyPartExercises = new Map<string, Set<string>>();

  // トレーニング記録をループして、部位ごとに種目名をセットに追加
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (!bodyPartExercises.has(exercise.bodyPart)) {
        bodyPartExercises.set(exercise.bodyPart, new Set());
      }
      bodyPartExercises.get(exercise.bodyPart)!.add(exercise.name);
    });
  });

  // 部位ごとの種目数でソートするために、マップを配列に変換してソート
  const sortedBodyParts = Array.from(bodyPartExercises.entries()).sort(
    (a, b) => b[1].size - a[1].size,
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-indigo-600" />
        <h2 className="text-gray-900">部位別トレーニング種目</h2>
      </div>

      <div className="space-y-4">
        {sortedBodyParts.map(([bodyPart, exercises]) => (
          <div key={bodyPart} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span
                className={`px-3 py-1 rounded-full border ${
                  bodyPartColors[bodyPart] ||
                  'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {bodyPart}
              </span>
              <span className="text-gray-600">{exercises.size}種目</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.from(exercises).map((exercise) => (
                <span
                  key={exercise}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                >
                  {exercise}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {sortedBodyParts.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          まだ記録がありません。トレーニングを追加しましょう！
        </p>
      )}
    </div>
  );
}
