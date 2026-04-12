'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import { bodyParts } from '@/lib/constants';
import { API_BASE_URL, fetchWithAuth } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';

export default function AdminExercisePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<
    { id: number; name: string; target_muscle: string }[]
  >([]);
  const [activeTab, setActiveTab] = useState(bodyParts[0]);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchExercises = async () => {
    fetchWithAuth(`${API_BASE_URL}/exercises`)
      .then((r) => r.json())
      .then((data) => setExercises(data))
      .catch((err) => console.error(err));
  };

  useAuth(true);
  useEffect(() => {
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

  const handleUpdate = async (id: number) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/exercises/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingName,
          target_muscle:
            exercises.find((ex) => ex.id === id)?.target_muscle ?? '',
          description: '',
        }),
      });
      toast.success('種目を更新しました');
      setEditingId(null);
      fetchExercises();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      toast.error(`更新に失敗しました:${message}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetchWithAuth(`${API_BASE_URL}/exercises/${id}`, {
        method: 'DELETE',
      });

      toast.success('種目を削除しました');
      fetchExercises();
      setEditingId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      toast.error(`削除に失敗しました:${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          戻る
        </button>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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

        <div className="flex gap-4">
          {bodyParts.map((part) => (
            <button
              key={part}
              onClick={() => setActiveTab(part)}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === part
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {part}
            </button>
          ))}
        </div>

        <ul className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
          {exercises
            .filter((ex) => ex.target_muscle === activeTab)
            .map((ex) => (
              <li
                key={ex.id}
                className="p-4 text-gray-900 flex items-center justify-between"
              >
                {editingId === ex.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(ex.id)}
                        className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:bg-gray-50 px-3 py-1 rounded-lg"
                      >
                        キャンセル
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {ex.name}
                    <div>
                      <button
                        onClick={() => {
                          setEditingId(ex.id);
                          setEditingName(ex.name);
                        }}
                        className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(ex.id)}
                        className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg"
                      >
                        削除
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
        </ul>
        <AlertDialog
          open={pendingDeleteId !== null}
          onOpenChange={(open) => !open && setPendingDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>この種目を削除しますか？</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => handleDelete(pendingDeleteId!)}>
                削除
              </AlertDialogAction>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
