'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/Dashboard';
import { Workout, Exercise, Set } from '@/types/database';
import { supabase } from '../../../lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = {
    id: '1',
    name: 'トレーニー',
    email: 'test@example.com', // 既存の情報をここに注入
  };

  useEffect(() => {
    fetchAndFormatWorkouts();
  }, []);

  const fetchAndFormatWorkouts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workout_logs')
      .select(`*`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('取得エラー：', error);
      setLoading(false);
      return;
    }

    if (data) {
      const groups = data.reduce((acc: any, log: any) => {
        const date = log.created_at.split('T')[0];

        if (!acc[date]) {
          acc[date] = {
            id: date,
            date: date,
            duration: 0,
            exercises: [],
            notes: '',
          };
        }

        const exerciseName = log.exercise_name || '不明な種目';
        const bodyPart = log.body_part || 'その他';

        let exercise = acc[date].exercises.find(
          (e: any) => e.name === exerciseName,
        );

        if (!exercise) {
          exercise = {
            id: `${date} -${exerciseName}`,
            name: exerciseName,
            bodyPart: bodyPart,
            sets: [],
          };
          acc[date].exercises.push(exercise);
        }

        exercise.sets.push({
          weight: log.weight,
          reps: log.reps,
        });

        return acc;
      }, {});

      const formattedData = Object.values(groups);
      console.log('画面に渡す最終データ：', formattedData);
      setWorkouts(formattedData as Workout[]);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center">データを取得中...</div>;

  return (
    <Dashboard
      user={currentUser}
      workouts={workouts}
      onViewWorkout={(workout) => router.push(`/workouts/${workout.id}`)}
      onLogout={() => router.push('/login')}
    />
  );
}
