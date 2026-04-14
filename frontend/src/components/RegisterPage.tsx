import { useState } from 'react';
import { NotebookPen } from 'lucide-react';

type RegisterPageProps = {
  onRegister: (name: string, email: string, password: string) => void;
};

export function RegisterPage({ onRegister }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password && password === confirmPassword) {
      onRegister(name, email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-4 rounded-full mb-4">
            <NotebookPen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">新規登録</h1>
          <p className="text-gray-600">新しいアカウントを作成してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-2">
              名前
            </label>
            <input
              id="name"
              type="text"
              autoComplete="off"
              name="name_field_random"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="お名前"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              autoComplete="off"
              name="email_field_random"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 mb-2"
            >
              確認用パスワード
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="off"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            登録
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">
            すでにアカウントをお持ちの方は{' '}
            <a href="/login" className="text-indigo-600 hover:underline">
              ログイン
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
