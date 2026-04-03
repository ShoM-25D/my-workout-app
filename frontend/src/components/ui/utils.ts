import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  // clsxでクラス名を結合し、twMergeで重複するクラス名をマージして返す
  return twMerge(clsx(inputs));
}
