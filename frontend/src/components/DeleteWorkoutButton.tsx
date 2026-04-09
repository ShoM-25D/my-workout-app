import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type DeleteWorkoutButtonProps = {
  date: string;
  onSuccess?: () => void;
  onDelete: (date: string) => Promise<void>;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  className?: string;
  children?: React.ReactNode;
};

export function DeleteWorkoutButton({
  date,
  onSuccess,
  onDelete,
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
      await onDelete(date);
      onSuccess?.();
    } catch (error) {
      toast.error(`削除失敗しました。:${error}`);
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
