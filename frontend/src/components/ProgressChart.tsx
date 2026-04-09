import { Workout } from '@/types/database';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { bodyParts } from '@/lib/constants';

// トレーニングの重量推移を表示するコンポーネント
type ProgressChartProps = {
  workouts: Workout[];
};

type DataPoint = {
  date: string;
  [key: string]: string | number;
};

// トレーニング記録から種目ごとの重量推移を計算し、LineChartで表示するコンポーネント
export function ProgressChart({ workouts }: ProgressChartProps) {
  // トレーニング記録から種目名のセットを作成
  const [activeTab, setActiveTab] = useState<string>('胸');

  // 種目ごとの頻度を計算して、上位3種目を抽出
  const exerciseFrequency = new Map<string, number>();
  workouts?.forEach((workout) => {
    workout.exercises?.forEach((exercise) => {
      exerciseFrequency.set(
        exercise.name,
        (exerciseFrequency.get(exercise.name) || 0) + 1,
      );
    });
  });

  // 頻度の高い上位3種目を抽出
  const topExercises = Array.from(exerciseFrequency.entries())
    .filter(([name]) => {
      return workouts.some((workout) =>
        workout.exercises.some(
          (exercise) =>
            exercise.name === name && exercise.bodyPart === activeTab,
        ),
      );
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  // トレーニング記録を日付順に並べ替え、上位3種目の重量推移のデータポイントを作成
  const chartData = workouts
    .slice()
    .reverse()
    .slice(-10) // Last 10 workouts
    .map((workout) => {
      const dataPoint: DataPoint = {
        date: new Date(workout.date).toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
        }),
      };

      // 上位3種目の重量をデータポイントに追加。該当種目がない場合は0とする
      topExercises.forEach((exerciseName) => {
        const exercise = workout.exercises.find((e) => e.name === exerciseName);
        dataPoint[exerciseName] = 0;

        if (exercise && exercise.sets && exercise.sets.length > 0) {
          const weights = exercise.sets
            .map((s) => Number(s.weight))
            .filter((w) => !isNaN(w));
          if (weights.length > 0) {
            dataPoint[exerciseName] = Math.max(...weights);
          }
        }
      });

      return dataPoint;
    });

  // ラインの色を定義。上位3種目に対応させる
  const colors = ['#6366f1', '#ec4899', '#10b981'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h2 className="text-gray-900">重量推移</h2>
      </div>

      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {bodyParts.map((part) => (
          <button
            key={part}
            onClick={() => setActiveTab(part)}
            className={`px-3 pb-2 border-b-2 transition-colors ${activeTab === part ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            {part}
          </button>
        ))}
      </div>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              label={{ value: '重量 (kg)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            {topExercises.map((exercise, index) => (
              <Line
                key={exercise}
                type="monotone"
                dataKey={exercise}
                stroke={colors[index]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-center py-8">
          まだ記録がありません。トレーニングを追加しましょう！
        </p>
      )}
    </div>
  );
}
