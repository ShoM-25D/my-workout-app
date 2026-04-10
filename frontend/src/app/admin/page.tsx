'use client';

import { API_BASE_URL, fetchWithAuth } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { bodyParts } from '@/lib/constants';

export default function AdminExercisePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<
    { id: number; name: string; target_muscle: string }[]
  >([]);

  const fetchExercises = async () => {
    fetchWithAuth(`${API_BASE_URL}/exercises`)
      .then((r) => r.json())
      .then((data) => setExercises(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/login');
      return;
    }

    const is_admin = localStorage.getItem('is_admin') === 'true';

    if (!is_admin) {
      toast.error('アクセス権限がありません');
      router.push('/dashboard');
      return;
    }

    fetchExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDuplicate = exercises.some((ex) => ex.name === name);
    if (isDuplicate) {
      toast.error('その種目は既に登録されています');
      return;
    }

    try {
      await fetchWithAuth(`${API_BASE_URL}/exercises`, {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          target_muscle: targetMuscle,
          description: description,
        }),
      });

      toast.success('種目を登録しました');
      setName('');
      setTargetMuscle('');
      setDescription('');
      fetchExercises();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      toast.error(`保存に失敗しました:${message}`);
    }
  };

  return (
    <div>
      <h1>種目管理</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="種目名"
        />
        <select
          value={targetMuscle}
          onChange={(e) => setTargetMuscle(e.target.value)}
        >
          <option value="">選択してください</option>
          {bodyParts.map((part) => (
            <option key={part} value={part}>
              {part}
            </option>
          ))}
        </select>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明"
        />
        <button type="submit" disabled={!name || !targetMuscle}>
          登録
        </button>
      </form>

      <ul>
        {exercises.map((ex) => (
          <li key={ex.id}>
            {ex.name}/{ex.target_muscle}
          </li>
        ))}
      </ul>
    </div>
  );
}
