'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Workout } from '@/types/database';
import { WorkoutDetail } from '@/components/WorkoutDetail';
import { fetchWithAuth, API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  const handleExerciseDeleted = async (deletedExerciseId: string) => {
    if (!window.confirm('この種目を削除しますか？')) return;
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/workout_exercise/${deletedExerciseId}`,
        {
          method: 'DELETE',
        },
      );
      if (response.ok) {
        const updatedExercises = workout!.exercises.filter(
          (ex) => ex.id != deletedExerciseId,
        );
        if (updatedExercises.length === 0) {
          if (window.confirm('この日のメモも削除しますか')) {
            await fetchWithAuth(`${API_BASE_URL}/workouts/${workout!.id}`, {
              method: 'DELETE',
            });
          }
          router.push('/dashboard');
          return;
        }
        setWorkout({ ...workout!, exercises: updatedExercises });
      }
    } catch (error) {
      toast.error(`削除失敗しました。:${error}`);
    }
  };

  useEffect(() => {
    const id = params.id;
    fetchWithAuth(`${API_BASE_URL}/workouts/${id}`)
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
