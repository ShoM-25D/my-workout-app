export interface Set {
  weight: number;
  reps: number;
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  sets: Set[];
}

export interface Workout {
  id: string;
  date: string;
  duration: number;
  bodyWeight?: number;
  bodyFat?: number;
  exercises: Exercise[];
  notes?: string;
}

export const mockWorkouts: Workout[] = [
  {
    id: '1',
    date: '2024-12-15',
    duration: 75,
    bodyWeight: 72.5,
    bodyFat: 15.2,
    exercises: [
      {
        id: 'e1',
        name: 'ベンチプレス',
        bodyPart: '胸',
        sets: [
          { weight: 60, reps: 10 },
          { weight: 70, reps: 8 },
          { weight: 75, reps: 6 },
          { weight: 80, reps: 4 },
        ],
      },
      {
        id: 'e2',
        name: 'インクラインプレス',
        bodyPart: '胸',
        sets: [
          { weight: 50, reps: 10 },
          { weight: 55, reps: 8 },
          { weight: 55, reps: 8 },
        ],
      },
      {
        id: 'e3',
        name: 'チェストフライ',
        bodyPart: '胸',
        sets: [
          { weight: 30, reps: 12 },
          { weight: 30, reps: 12 },
          { weight: 30, reps: 10 },
        ],
      },
    ],
    notes: '調子が良かった。ベンチプレスで80kgを挙げられた！',
  },
  {
    id: '2',
    date: '2024-12-13',
    duration: 80,
    bodyWeight: 72.3,
    bodyFat: 15.3,
    exercises: [
      {
        id: 'e4',
        name: 'デッドリフト',
        bodyPart: '背中',
        sets: [
          { weight: 100, reps: 8 },
          { weight: 110, reps: 6 },
          { weight: 120, reps: 5 },
        ],
      },
      {
        id: 'e5',
        name: 'ラットプルダウン',
        bodyPart: '背中',
        sets: [
          { weight: 60, reps: 10 },
          { weight: 65, reps: 8 },
          { weight: 70, reps: 6 },
        ],
      },
      {
        id: 'e6',
        name: 'ベントオーバーロー',
        bodyPart: '背中',
        sets: [
          { weight: 50, reps: 10 },
          { weight: 55, reps: 8 },
          { weight: 55, reps: 8 },
        ],
      },
    ],
    notes: 'デッドリフトで120kg達成！背中にしっかり効いた。',
  },
  {
    id: '3',
    date: '2024-12-11',
    duration: 70,
    bodyWeight: 72.1,
    exercises: [
      {
        id: 'e7',
        name: 'スクワット',
        bodyPart: '脚',
        sets: [
          { weight: 80, reps: 10 },
          { weight: 90, reps: 8 },
          { weight: 100, reps: 6 },
          { weight: 100, reps: 6 },
        ],
      },
      {
        id: 'e8',
        name: 'レッグプレス',
        bodyPart: '脚',
        sets: [
          { weight: 150, reps: 12 },
          { weight: 160, reps: 10 },
          { weight: 170, reps: 8 },
        ],
      },
      {
        id: 'e9',
        name: 'レッグカール',
        bodyPart: '脚',
        sets: [
          { weight: 40, reps: 12 },
          { weight: 45, reps: 10 },
          { weight: 45, reps: 10 },
        ],
      },
    ],
    notes: 'レッグデイ。しっかり追い込めた。',
  },
  {
    id: '4',
    date: '2024-12-09',
    duration: 60,
    bodyWeight: 72.0,
    bodyFat: 15.4,
    exercises: [
      {
        id: 'e10',
        name: 'ショルダープレス',
        bodyPart: '肩',
        sets: [
          { weight: 40, reps: 10 },
          { weight: 45, reps: 8 },
          { weight: 50, reps: 6 },
        ],
      },
      {
        id: 'e11',
        name: 'サイドレイズ',
        bodyPart: '肩',
        sets: [
          { weight: 12, reps: 15 },
          { weight: 14, reps: 12 },
          { weight: 14, reps: 12 },
        ],
      },
      {
        id: 'e12',
        name: 'フロントレイズ',
        bodyPart: '肩',
        sets: [
          { weight: 10, reps: 15 },
          { weight: 12, reps: 12 },
          { weight: 12, reps: 10 },
        ],
      },
    ],
    notes: '肩トレーニング。サイドレイズでパンプ感がすごかった。',
  },
  {
    id: '5',
    date: '2024-12-07',
    duration: 65,
    bodyWeight: 71.8,
    exercises: [
      {
        id: 'e13',
        name: 'バーベルカール',
        bodyPart: '腕',
        sets: [
          { weight: 30, reps: 10 },
          { weight: 35, reps: 8 },
          { weight: 35, reps: 8 },
        ],
      },
      {
        id: 'e14',
        name: 'トライセプスエクステンション',
        bodyPart: '腕',
        sets: [
          { weight: 25, reps: 12 },
          { weight: 30, reps: 10 },
          { weight: 30, reps: 8 },
        ],
      },
      {
        id: 'e15',
        name: 'ハンマーカール',
        bodyPart: '腕',
        sets: [
          { weight: 15, reps: 12 },
          { weight: 17.5, reps: 10 },
          { weight: 17.5, reps: 10 },
        ],
      },
    ],
    notes: '腕の日。二頭筋と三頭筋をバランスよくトレーニング。',
  },
  {
    id: '6',
    date: '2024-12-05',
    duration: 70,
    bodyWeight: 71.7,
    bodyFat: 15.5,
    exercises: [
      {
        id: 'e16',
        name: 'ベンチプレス',
        bodyPart: '胸',
        sets: [
          { weight: 60, reps: 10 },
          { weight: 65, reps: 8 },
          { weight: 70, reps: 6 },
          { weight: 75, reps: 5 },
        ],
      },
      {
        id: 'e17',
        name: 'ダンベルプレス',
        bodyPart: '胸',
        sets: [
          { weight: 30, reps: 10 },
          { weight: 32.5, reps: 8 },
          { weight: 32.5, reps: 8 },
        ],
      },
    ],
    notes:
      '胸トレーニング2回目。前回より重量が少し下がったが、フォームを意識した。',
  },
  {
    id: '7',
    date: '2024-12-03',
    duration: 75,
    bodyWeight: 71.5,
    exercises: [
      {
        id: 'e18',
        name: 'デッドリフト',
        bodyPart: '背中',
        sets: [
          { weight: 90, reps: 8 },
          { weight: 100, reps: 6 },
          { weight: 110, reps: 5 },
        ],
      },
      {
        id: 'e19',
        name: '懸垂',
        bodyPart: '背中',
        sets: [
          { weight: 0, reps: 10 },
          { weight: 0, reps: 8 },
          { weight: 0, reps: 7 },
        ],
      },
    ],
    notes: '背中の日。懸垂を追加してみた。',
  },
  {
    id: '8',
    date: '2024-12-01',
    duration: 65,
    bodyWeight: 71.4,
    bodyFat: 15.6,
    exercises: [
      {
        id: 'e20',
        name: 'スクワット',
        bodyPart: '脚',
        sets: [
          { weight: 70, reps: 10 },
          { weight: 80, reps: 8 },
          { weight: 90, reps: 6 },
        ],
      },
      {
        id: 'e21',
        name: 'レッグエクステンション',
        bodyPart: '脚',
        sets: [
          { weight: 50, reps: 15 },
          { weight: 55, reps: 12 },
          { weight: 60, reps: 10 },
        ],
      },
    ],
    notes: 'スクワットで90kgに挑戦。次は100kg目指す！',
  },
];
