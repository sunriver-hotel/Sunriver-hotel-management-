
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
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
       <div className="absolute top-4 right-4 space-x-2">
            <button onClick={() => handleSetLanguage('th')} className={`px-4 py-2 rounded-md text-sm font-medium ${language === 'th' ? 'bg-[#e6c872] text-white' : 'bg-white text-gray-600'}`}>ไทย</button>
            <button onClick={() => handleSetLanguage('en')} className={`px-4 py-2 rounded-md text-sm font-medium ${language === 'en' ? 'bg-[#e6c872] text-white' : 'bg-white text-gray-600'}`}>English</button>
        </div>
      <div className="p-8 bg-white rounded-2xl shadow-2xl w-full max-w-md m-4">
        <div className="flex flex-col items-center mb-8">
            <Logo />
            <h1 className="text-2xl font-bold text-gray-700 mt-4">{t('sunriver_hotel_th')}</h1>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">{t('username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#e6c872] focus:border-[#e6c872] transition"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#e6c872] focus:border-[#e6c872] transition"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-[#e6c872] text-white rounded-lg font-semibold hover:bg-amber-500 transition-colors shadow-md disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : t('login')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
