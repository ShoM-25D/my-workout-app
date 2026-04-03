import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';

export type PersonalRecord = {
  exercise_name: string;
  max_weight: number;
};

export type FrequencyStats = {
  total: number;
  this_month: number;
  this_week: number;
  average_per_week: number;
};

export function useStats() {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [frequency, setFrequency] = useState<FrequencyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('http://localhost:8000/stats/personal_records')
      .then((r) => r.json())
      .then((data) => setPersonalRecords(data))
      .catch((err) => console.error(err));

    fetchWithAuth('http://localhost:8000/stats/frequency')
      .then((r) => r.json())
      .then((data) => setFrequency(data[0]))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return { personalRecords, frequency, loading };
}
