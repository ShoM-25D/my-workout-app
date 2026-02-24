import { Workout } from '@/mocks/mockWorkouts';
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

// トレーニングの重量推移を表示するコンポーネント
type ProgressChartProps = {
  workouts: Workout[];
};

// トレーニング記録から種目ごとの重量推移を計算し、LineChartで表示するコンポーネント
export function ProgressChart({ workouts }: ProgressChartProps) {
  // トレーニング記録から種目名のセットを作成
  const exercises = new Set<string>();
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercises.add(exercise.name);
    });
  });

  // 種目ごとの頻度を計算して、上位3種目を抽出
  const exerciseFrequency = new Map<string, number>();
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exerciseFrequency.set(
        exercise.name,
        (exerciseFrequency.get(exercise.name) || 0) + 1,
      );
    });
  });

  // 頻度の高い上位3種目を抽出
  const topExercises = Array.from(exerciseFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  // トレーニング記録を日付順に並べ替え、上位3種目の重量推移のデータポイントを作成
  const chartData = workouts
    .slice()
    .reverse()
    .slice(-10) // Last 10 workouts
    .map((workout) => {
      const dataPoint: any = {
        date: new Date(workout.date).toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
        }),
      };

      // 上位3種目の重量をデータポイントに追加。該当種目がない場合は0とする
      topExercises.forEach((exerciseName) => {
        const exercise = workout.exercises.find((e) => e.name === exerciseName);
        if (exercise && exercise.sets.length > 0) {
          dataPoint[exerciseName] = Math.max(
            ...exercise.sets.map((s) => s.weight),
          );
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
