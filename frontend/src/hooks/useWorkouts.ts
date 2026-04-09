import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth, API_BASE_URL } from '@/lib/api';
import { Workout } from '@/types/database';
import { mockWorkouts as initialMockWorkouts } from '@/mocks/mockWorkouts';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth(`${API_BASE_URL}/workouts`);
      const data: Workout[] = await response.json();
      setWorkouts(data);
    } catch (err: any) {
      console.error('Error fetching workouts:', err);
      setError(err.message);
      setWorkouts(initialMockWorkouts);
    } finally {
      setLoading(false);
    }
  }, []);

  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    try {
      setLoading(true);

      const response = await fetchWithAuth(`${API_BASE_URL}/workouts`, {
        method: 'POST',
        body: JSON.stringify({
          date: workout.date,
          duration: workout.duration,
          notes: workout.notes,
          body_weight: workout.bodyWeight ?? null,
          body_fat: workout.bodyFat ?? null,
          exercises: workout.exercises.map((ex) => ({
            name: ex.name,
            body_part: ex.bodyPart,
            sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        await fetchWorkouts();
        return data;
      }
    } catch (err: any) {
      console.error('Error adding workout:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (date: string) => {
    try {
      setLoading(true);

      const response = await fetchWithAuth(
        `${API_BASE_URL}/workouts/by-date/${date}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }

      const data = await response.json();

      if (data) {
        await fetchWorkouts();
        return data;
      }
    } catch (err: any) {
      console.error('Error adding workout:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/workout_exercise/${exerciseId}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      console.error('Error adding workout:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkoutById = async (workoutId: string) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/workouts/${workoutId}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      console.error('Error adding workout:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    workouts,
    loading,
    error,
    fetchWorkouts,
    addWorkout,
    deleteWorkout,
    deleteExercise,
    deleteWorkoutById,
  };
}
