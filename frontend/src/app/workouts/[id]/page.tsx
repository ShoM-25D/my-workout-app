'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Workout } from '@/types/database';
import { WorkoutDetail } from '@/components/WorkoutDetail';
import { fetchWithAuth, API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteExerciseOpen, setIsDeleteExerciseOpen] = useState(false);
  const [isDeleteMemoOpen, setIsDeleteMemoOpen] = useState(false);
  const [pendingExerciseId, setPendingExerciseId] = useState<string | null>(
    null,
  );
  const { deleteExercise, deleteWorkoutById } = useWorkouts();

  const handleExerciseDeleted = (deletedExerciseId: string) => {
    setPendingExerciseId(deletedExerciseId);
    setIsDeleteExerciseOpen(true);
  };

  const confirmExerciseDelete = async () => {
    try {
      await deleteExercise(pendingExerciseId!);
      const updatedExercises = workout!.exercises.filter(
        (ex) => ex.id != pendingExerciseId,
      );
      if (updatedExercises.length === 0) {
        setIsDeleteExerciseOpen(false);
        setIsDeleteMemoOpen(true);
        return;
      }
      setWorkout({ ...workout!, exercises: updatedExercises });
    } catch (error) {
      toast.error(`削除失敗しました。:${error}`);
    }
  };

  const confirmMemoDelete = async () => {
    await deleteWorkoutById(workout!.id);
    router.push('/dashboard');
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
    <>
      <WorkoutDetail
        workout={workout!}
        onBack={() => router.push('/dashboard')}
        onExerciseDeleted={handleExerciseDeleted}
      />
      <AlertDialog
        open={isDeleteExerciseOpen}
        onOpenChange={setIsDeleteExerciseOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この種目を削除しますか</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={confirmExerciseDelete}>
              削除
            </AlertDialogAction>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isDeleteMemoOpen} onOpenChange={setIsDeleteMemoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この日のメモも削除しますか</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={confirmMemoDelete}>
              削除
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => router.push('/dashboard')}>
              キャンセル
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
