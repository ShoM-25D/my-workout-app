import { Workout } from '../App';
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

type ProgressChartProps = {
  workouts: Workout[];
};

export function ProgressChart({ workouts }: ProgressChartProps) {
  // Get all unique exercises
  const exercises = new Set<string>();
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercises.add(exercise.name);
    });
  });

  // For simplicity, show progress for top 3 exercises by frequency
  const exerciseFrequency = new Map<string, number>();
  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exerciseFrequency.set(
        exercise.name,
        (exerciseFrequency.get(exercise.name) || 0) + 1,
      );
    });
  });

  const topExercises = Array.from(exerciseFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  // Build chart data
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
