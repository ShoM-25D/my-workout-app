'use client';

import { useState } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { WorkoutDetail } from '@/components/WorkoutDetail';
import { mockWorkouts, type Workout } from '@/mocks/mockWorkouts';

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

  // ユーザのログイン情報、画面の状態を管理 - handle系
  const handleLogin = (email: string, password: string) => {
    // Mock login - 本番環境では認証情報を検証します
    setCurrentUser({
      id: '1',
      name: 'トレーニー',
      email: email,
    });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
          workouts={mockWorkouts}
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
