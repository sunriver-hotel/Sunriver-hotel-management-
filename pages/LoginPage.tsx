
import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { Logo } from '../components/Icons';
import { Language } from '../types';

interface LoginPageProps {
  onLogin: (user: string, pass: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { language, setLanguage, t } = useContext(AppContext);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin2');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
    setIsLoading(false);
  };
  
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50/50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-center mb-6">
                <Logo />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('sunriver_hotel_th')}</h1>
            <p className="text-center text-gray-500 mb-6">{t('sunriver_hotel')}</p>
            <div className="flex justify-center space-x-2 mb-8">
                <button
                    onClick={() => handleSetLanguage('th')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition ${language === 'th' ? 'bg-[#e6c872] text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    ไทย
                </button>
                <button
                    onClick={() => handleSetLanguage('en')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition ${language === 'en' ? 'bg-[#e6c872] text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    English
                </button>
            </div>
            <form onSubmit={handleLogin}>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">{t('username')}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full mt-1 p-3 border rounded-md focus:ring-amber-400 focus:border-amber-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">{t('password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-3 border rounded-md focus:ring-amber-400 focus:border-amber-400"
                            required
                        />
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <button
                    type="submit"
                    className="w-full mt-6 bg-[#e6c872] text-white p-3 rounded-md font-semibold hover:bg-amber-500 transition shadow-md disabled:bg-gray-400"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : t('login')}
                </button>
            </form>
        </div>
        <div className="text-center text-sm text-gray-500 mt-4">
            Version 0.903
        </div>
      </div>
    </div>
  );
};

export default LoginPage;