'use client';

import { useState } from 'react';
import { LoginPage } from '../components/LoginPage';
import { Dashboard } from '../components/Dashboard';
import { WorkoutDetail } from '../components/WorkoutDetail';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Exercise = {
  id: string;
  name: string;
  sets: {
    weight: number;
    reps: number;
  }[];
  bodyPart: string;
};

export type Workout = {
  id: string;
  date: string;
  duration: number;
  exercises: Exercise[];
  notes?: string;
  bodyWeight?: number;
  bodyFat?: number;
};

export type View = 'login' | 'dashboard' | 'detail';

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Mock login - in production this would validate credentials
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
