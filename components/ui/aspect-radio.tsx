'use client';

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

// 画面の表示比率を維持するためのコンポーネント
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
