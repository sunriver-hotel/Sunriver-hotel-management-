import React, { useContext, useRef } from 'react';
import { AppContext } from '../App';
import { HomeIcon, BedIcon, ChartIcon, CleaningIcon, ReceiptIcon, LogoutIcon, Logo, UploadIcon } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-[#e6c872] text-white shadow-md'
        : 'text-gray-600 hover:bg-amber-100'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium hidden md:inline">{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  const { t, logout, setLogoUrl } = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (setLogoUrl) {
                setLogoUrl(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const navItems = [
    { id: 'home', label: t('home'), icon: <HomeIcon className="w-5 h-5" /> },
    { id: 'room-status', label: t('room_status'), icon: <BedIcon className="w-5 h-5" /> },
    { id: 'dashboard', label: t('dashboard'), icon: <ChartIcon className="w-5 h-5" /> },
    { id: 'cleaning', label: t('cleaning'), icon: <CleaningIcon className="w-5 h-5" /> },
    { id: 'receipt', label: t('receipt'), icon: <ReceiptIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="h-screen bg-slate-100 md:flex">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg no-print">
        <div 
          className="flex items-center justify-center md:justify-start h-20 px-4 border-b relative group cursor-pointer"
          onClick={triggerFileUpload}
        >
           <Logo />
           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
               <UploadIcon className="w-6 h-6" />
               <span className="ml-2 hidden md:inline">Upload</span>
           </div>
           <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                className="hidden"
                accept="image/*"
            />
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activePage === item.id}
              onClick={() => setActivePage(item.id)}
            />
          ))}
        </nav>
        <div className="px-2 py-4 border-t">
          <NavItem
            icon={<LogoutIcon className="w-5 h-5" />}
            label={t('logout')}
            isActive={false}
            onClick={logout}
          />
        </div>
      </aside>

      {/* --- MAIN WRAPPER (for mobile layout and desktop content) --- */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* --- TOP HEADER (for mobile and desktop) --- */}
        <header className="flex items-center justify-between md:justify-between h-16 md:h-20 px-4 md:px-6 bg-white border-b no-print shrink-0">
          <div className="md:hidden">
            <Logo />
          </div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">
              {navItems.find(item => item.id === activePage)?.label}
          </h1>
          {/* Spacer for mobile to balance the title */}
          <div className="w-10 md:hidden"></div>
        </header>
        
        {/* --- MOBILE TOP NAV --- */}
        <nav className="md:hidden grid grid-cols-6 gap-1 bg-white p-1 border-b border-gray-200 shadow-md no-print shrink-0">
            {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex flex-col items-center justify-center text-center pt-2 pb-1 rounded-lg transition-colors w-full ${
                    activePage === item.id
                      ? 'bg-amber-100 text-[#e6c872]'
                      : 'text-gray-500 hover:bg-amber-50'
                  }`}
                >
                  {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                  <span className="text-[10px] mt-1 font-medium leading-tight">{item.label}</span>
                </button>
            ))}
            <button
              onClick={logout}
              className="flex flex-col items-center justify-center text-center pt-2 pb-1 rounded-lg transition-colors text-gray-500 hover:bg-amber-50 w-full"
            >
              <LogoutIcon className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium leading-tight">{t('logout')}</span>
            </button>
        </nav>

        {/* --- PAGE CONTENT --- */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
