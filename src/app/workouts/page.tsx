'use client';

import { mockWorkouts, type Workout } from '@/mocks/mockWorkouts';
import Link from 'next/link';

export default function WorkoutsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">ワークアウト一覧</h1>

      <div className="grid gap-4">
        {mockWorkouts.map((workout: Workout) => (
          <div
            key={workout.id}
            className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">
              {workout.date}のトレーニング
            </h2>
            <p className="text-gray-600">
              種目数: {workout.exercises.length}種目
            </p>

            {/* 詳細ページへのリンク（後で作成します） */}
            <Link
              href={`/workouts/${workout.id}`}
              className="mt-2 inline-block text-blue-500 hover:underline"
            >
              詳細を見る →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm text-gray-500">
          ← トップへ戻る
        </Link>
      </div>
    </div>
  );
}
