'use client';

import { useState, useEffect } from 'react';
import { Workout } from '@/types/database';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*') // 本来はここで exercises も結合して取得
        .order('created_at', { ascending: false });

      if (error) {
        console.error('エラー:', error);
      } else {
        // ※ここでデータの整形（平坦なデータをWorkout型に変換）が必要ですが、一旦セット
        setWorkouts(data as any);
      }
      setLoading(false);
    };

    fetchWorkouts();
  }, []);

  if (loading) return <div className="p-8">読み込み中...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">ワークアウト一覧</h1>

      <div className="grid gap-4">
        {workouts.length === 0 ? (
          <p>データがありません。</p>
        ) : (
          workouts.map((workout: Workout) => (
            <div
              key={workout.id}
              className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold">
                {new Date(workout.date).toLocaleDateString()}のトレーニング
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
          ))
        )}
      </div>

      <div className="mt-8">
        <Link href="/" className="text-sm text-gray-500">
          ← トップへ戻る
        </Link>
      </div>
    </div>
  );
}
