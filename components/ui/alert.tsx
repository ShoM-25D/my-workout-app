import * as React from 'react';
// class-variance-authorityを用いて管理されたクラス名を生成するためのライブラリ
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './utils';

const alertVariants = cva(
  // アイコンとテキストをグリッドレイアウトで配置し、全体のスタイルを定義
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        // カードのような落ち着いた背景色
        default: 'bg-card text-card-foreground',
        // 文字が赤色になり、アイコンも連動して変わる
        destructive:
          'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// 全体を囲む箱
function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      // スクリーンリーダーに対して、これは重要な情報を伝える要素であることを示すための属性
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

// 短い一言見出し
function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        // アイコンがある場合は2列目から始まり、テキストが1行に収まるようにし、最小の高さを設定して、フォントを太字にし、文字間を詰める
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className,
      )}
      {...props}
    />
  );
}

// 複数行の説明テキスト
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        // アイコンがある場合は2列目から始まり、テキストを左揃えにし、行間を広げ、文字サイズを小さくする
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
