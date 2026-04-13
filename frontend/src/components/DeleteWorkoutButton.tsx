import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(date);
      onSuccess?.();
    } catch (error) {
      toast.error(`削除失敗しました。:${error}`);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        disabled={isLoading}
      >
        {isLoading ? '削除中...' : children || <Trash2 className="w-4 h-4" />}
      </Button>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{date}の記録を全て削除しますか</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              削除
            </AlertDialogAction>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              キャンセル
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
