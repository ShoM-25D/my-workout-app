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
    />
  );
}
