import { useState } from 'react';
import { User } from '@/app/page';
import { Workout } from '@/mocks/mockWorkouts';
import {
  LogOut,
  Plus,
  TrendingUp,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { WorkoutList } from './WorkoutList';
import { PersonalRecords } from './PersonalRecords';
import { BodyPartOverview } from '@/components/BodyPartOverview';
import { AddWorkoutModal } from '@/components/AddWorkoutModal';
import { ProgressChart } from './ProgressChart';
import { CalendarView } from '@/components/CalendarView';

type DashboardProps = {
  user: User;
  workouts: Workout[];
  onLogout: () => void;
  onViewWorkout: (workout: Workout) => void;
};

export function Dashboard({
  user,
  workouts,
  onLogout,
  onViewWorkout,
}: DashboardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'stats' | 'calendar'>(
    'list',
  );

  const handleAddWorkout = (workout: Workout) => {
    // 新しいトレーニングをリストの先頭に追加
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">筋トレメモ</h1>
                <p className="text-gray-600">ようこそ、{user.name}さん</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PersonalRecords workouts={workouts} />
          <BodyPartOverview workouts={workouts} />
        </div>

        {/* Progress Chart */}
        <div className="mb-8">
          <ProgressChart workouts={workouts} />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === 'list'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  トレーニング記録
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === 'stats'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  統計情報
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`pb-2 border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'calendar'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  カレンダー
                </button>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                記録を追加
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'list' && (
              <WorkoutList workouts={workouts} onViewWorkout={onViewWorkout} />
            )}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-gray-600 mb-2">総トレーニング数</p>
                    <p className="text-blue-600">{workouts.length}回</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <p className="text-gray-600 mb-2">今月のトレーニング</p>
                    <p className="text-green-600">
                      {
                        workouts.filter((w) => {
                          const date = new Date(w.date);
                          const now = new Date();
                          return (
                            date.getMonth() === now.getMonth() &&
                            date.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                      回
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <p className="text-gray-600 mb-2">平均トレーニング時間</p>
                    <p className="text-purple-600">
                      {Math.round(
                        workouts.reduce((sum, w) => sum + w.duration, 0) /
                          workouts.length,
                      )}
                      分
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'calendar' && <CalendarView workouts={workouts} />}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddWorkoutModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddWorkout}
        />
      )}
    </div>
  );
}
