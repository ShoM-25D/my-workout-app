import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Workout } from '../app/page';
import { mockWorkouts as initialMockWorkouts } from '../data/mockWorkouts';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初回ロード時にデータを取得
  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // SupabaseのURLが設定されているか確認
      const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!isSupabaseConfigured) {
        console.log('Supabase is not configured. Using mock data.');
        setWorkouts(initialMockWorkouts);
        return;
      }

      // Supabaseからデータを取得
      // テーブル名は 'workouts' と仮定
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // SupabaseのデータをWorkout型にマッピング
        // ※ 実際のテーブル構造に合わせて調整が必要です
        // ここではスネークケースからキャメルケースへの変換などを想定
        const mappedWorkouts: Workout[] = data.map((item: any) => ({
          id: item.id,
          date: item.date,
          duration: item.duration,
          exercises: item.exercises || [], // JSONBカラムとして保存されていると仮定
          notes: item.notes,
          bodyWeight: item.body_weight, // カラム名は body_weight と仮定
          bodyFat: item.body_fat, // カラム名は body_fat と仮定
        }));
        setWorkouts(mappedWorkouts);
      }
    } catch (err: any) {
      console.error('Error fetching workouts:', err);
      setError(err.message);
      // エラー時はモックデータを表示（開発中のフォールバック）
      setWorkouts(initialMockWorkouts);
    } finally {
      setLoading(false);
    }
  }, []);

  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    try {
      setLoading(true);
      const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!isSupabaseConfigured) {
        // モック動作: ローカルステートに追加
        const newWorkout = {
          ...workout,
          id: Math.random().toString(36).substr(2, 9),
        };
        setWorkouts((prev) => [newWorkout, ...prev]);
        return newWorkout;
      }

      // Supabaseへ保存
      const { data, error } = await supabase
        .from('workouts')
        .insert([
          {
            date: workout.date,
            duration: workout.duration,
            exercises: workout.exercises,
            notes: workout.notes,
            body_weight: workout.bodyWeight,
            body_fat: workout.bodyFat,
            // user_id: user.id // 認証済みユーザーIDが必要な場合
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await fetchWorkouts(); // 再取得
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

  return {
    workouts,
    loading,
    error,
    fetchWorkouts,
    addWorkout,
    // updateWorkout, deleteWorkout も同様に実装可能
  };
}
