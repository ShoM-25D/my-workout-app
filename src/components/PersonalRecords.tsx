import { Workout } from '../src/app/page';
import { Trophy } from 'lucide-react';

// 種目別の最高重量を表示するコンポーネント
type PersonalRecordsProps = {
  workouts: Workout[];
};

// トレーニング記録から種目別の最高重量を計算し、上位5件を表示するコンポーネント
export function PersonalRecords({ workouts }: PersonalRecordsProps) {
  // 種目名をキー、最高重量とその日付を値とするマップを作成
  const records = new Map<string, { weight: number; date: string }>();

  // トレーニング記録をループして、種目ごとに最高重量を更新していく
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        const current = records.get(exercise.name);
        if (!current || set.weight > current.weight) {
          records.set(exercise.name, {
            weight: set.weight,
            date: workout.date,
          });
        }
      });
    });
  });

  // マップを配列に変換して、重量の降順でソートし、上位5件を取得
  const sortedRecords = Array.from(records.entries())
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-gray-900">種目別最高重量</h2>
      </div>

      <div className="space-y-3">
        {sortedRecords.map(([name, record], index) => (
          <div
            key={name}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full">
                {index + 1}
              </div>
              <div>
                <p className="text-gray-900">{name}</p>
                <p className="text-gray-600">
                  {new Date(record.date).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-orange-600">{record.weight}kg</p>
            </div>
          </div>
        ))}
      </div>

      {sortedRecords.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          まだ記録がありません。トレーニングを追加しましょう！
        </p>
      )}
    </div>
  );
}
