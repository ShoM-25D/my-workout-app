'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/Dashboard';
import { User } from '@/types/database';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { workouts, loading, fetchWorkouts, deleteWorkout } = useWorkouts();

  useEffect(() => {
    const name = localStorage.getItem('user_name');
    const email = localStorage.getItem('user_email');
    const token = localStorage.getItem('access_token');

    if (!token || !name || !email) {
      router.push('/login');
      return;
    }

    setCurrentUser({
      id: '1',
      name,
      email,
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  if (loading || !currentUser)
    return <div className="p-8 text-center">データを取得中...</div>;

  return (
    <Dashboard
      user={currentUser}
      workouts={workouts}
      onDelete={deleteWorkout}
      onViewWorkout={(workout) => router.push(`/workouts/${workout.id}`)}
      onLogout={handleLogout}
      onRefresh={fetchWorkouts}
    />
  );
}
