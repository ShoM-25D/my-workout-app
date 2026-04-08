import { Button } from './ui/button';
import { fetchWithAuth } from '@/lib/api';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

type DeleteWorkoutButtonProps = {
  date: string;
  onSuccess?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  className?: string;
  children?: React.ReactNode;
};

export function DeleteWorkoutButton({
  date,
  onSuccess,
  variant = 'destructive',
  className,
  children,
}: DeleteWorkoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm(`${date}の記録を全て削除しますか`)) return;

    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `http://localhost:8000/workouts/by-date/${date}`,
        {
          method: 'DELETE',
        },
      );

      if (response.ok) {
        alert('削除完了しました');
        onSuccess?.();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || '削除に失敗しました。');
      }
    } catch (error) {
      alert(`削除失敗しました。:${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleDelete}
      disabled={isLoading}
    >
      {isLoading ? '削除中...' : children || <Trash2 className="w-4 h-4" />}
    </Button>
  );
}
