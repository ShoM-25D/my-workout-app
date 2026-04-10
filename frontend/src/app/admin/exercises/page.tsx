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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-gray-900 font-bold text-2xl mb-8">種目管理</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-gray-900 mb-4">種目を登録</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="種目名"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
            <button
              type="submit"
              disabled={!name || !targetMuscle}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              登録
            </button>
          </form>
        </div>

        <ul className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
          {exercises.map((ex) => (
            <li key={ex.id} className="p-4 text-gray-900">
              {ex.name}/{ex.target_muscle}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
