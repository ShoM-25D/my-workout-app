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
