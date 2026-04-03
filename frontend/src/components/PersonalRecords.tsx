import { Trophy } from 'lucide-react';
import { PersonalRecord } from '@/hooks/useStats';

// 種目別の最高重量を表示するコンポーネント
type PersonalRecordsProps = {
  records: PersonalRecord[];
  loading: boolean;
};

// トレーニング記録から種目別の最高重量を計算し、上位5件を表示するコンポーネント
export function PersonalRecords({ records, loading }: PersonalRecordsProps) {
  // 種目名をキー、最高重量とその日付を値とするマップを作成
  if (loading) return <div className="p-8 text-center">読み込み中...</div>;
  const top5 = records.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-gray-900">種目別最高重量</h2>
      </div>

      <div className="space-y-3">
        {top5.map((record, index) => (
          <div
            key={record.exercise_name}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full">
                {index + 1}
              </div>
              <div>
                <p className="text-gray-900">{record.exercise_name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-orange-600">{record.max_weight}kg</p>
            </div>
          </div>
        ))}
      </div>

      {top5.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          まだ記録がありません。トレーニングを追加しましょう！
        </p>
      )}
    </div>
  );
}
