'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Workout } from '@/types/database';
import { WorkoutDetail } from '@/components/WorkoutDetail';
import { fetchWithAuth } from '@/lib/api';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  const handleExerciseDeleted = async (deletedExerciseId: string) => {
    if (!window.confirm('この種目を削除しますか？')) return;
    try {
      const response = await fetchWithAuth(
        `http://localhost:8000/workout_exercise/${deletedExerciseId}`,
        {
          method: 'DELETE',
        },
      );
      if (response.ok) {
        alert('削除が完了しました');

        setWorkout((prev) => {
          if (!prev) return null;
          const updatedExercises = prev.exercises.filter(
            (ex) => ex.id !== deletedExerciseId,
          );
          if (updatedExercises.length === 0) {
            fetchWithAuth(`http://localhost:8000/workouts/${params.id}`, {
              method: 'DELETE',
            }).then(() => {
              router.push('/dashboard');
            });
            return null;
          }
          return {
            ...prev,
            exercises: updatedExercises,
          };
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || '削除に失敗しました。');
      }
    } catch (error) {
      alert(`削除失敗しました。:${error}`);
    }
  };
  useEffect(() => {
    if (loading || !workout) return;
    if (workout.exercises.length == 0) {
      alert('すべての種目が削除されました。ダッシュボードに戻ります。');
      router.push('/dashboard');
    }
  }, [workout, loading, router]);

  useEffect(() => {
    const id = params.id;
    fetchWithAuth(`http://localhost:8000/workouts/${id}`)
      .then((r) => r.json())
      .then((data) => setWorkout(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <WorkoutDetail
      workout={workout!}
      onBack={() => router.push('/dashboard')}
      onExerciseDeleted={handleExerciseDeleted}
    />
  );
}
