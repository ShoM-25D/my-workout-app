'use client';

import { useState, useEffect } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { WorkoutDetail } from '@/components/WorkoutDetail';
import { Workout } from '@/types/database';
import { supabase } from '../../lib/supabase';

// ログインユーザの情報
export type User = {
  id: string;
  name: string;
  email: string;
};

// アプリの表示状態
export type View = 'login' | 'dashboard' | 'detail';

function App() {
  // 簡易型ルーティング（今後はReact Routerなどを導入予定、戻るができない）
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  // ワークアウトデータ - 今後はSupabaseから取得予定
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchWorkouts();
    }
  }, [currentUser]);

  const fetchWorkouts = async () => {
    const { data, error } = await supabase.from('workouts').select('*');

    if (error) {
      console.error('データ取得失敗:', error);
    } else {
      setWorkouts(data as any);
    }
  };

  // ユーザのログイン情報、画面の状態を管理 - handle系
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('ログイン失敗：' + error.message);
      return;
    }

    if (data.user) {
      setCurrentUser({
        id: data.user.id,
        name: data.user.email?.split('@')[0] || 'トレーニー',
        email: data.user.email || '',
      });
      setCurrentView('dashboard');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setWorkouts([]);
    setCurrentView('login');
  };

  const handleViewWorkoutDetail = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentView('detail');
  };

  const handleBackToDashboard = () => {
    setSelectedWorkout(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'login' && <LoginPage onLogin={handleLogin} />}
      {currentView === 'dashboard' && currentUser && (
        <Dashboard
          user={currentUser}
          workouts={workouts}
          onLogout={handleLogout}
          onViewWorkout={handleViewWorkoutDetail}
        />
      )}
      {currentView === 'detail' && selectedWorkout && (
        <WorkoutDetail
          workout={selectedWorkout}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default App;
