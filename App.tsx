
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RoomStatusPage from './pages/RoomStatusPage';
import DashboardPage from './pages/DashboardPage';
import CleaningPage from './pages/CleaningPage';
import ReceiptPage from './pages/ReceiptPage';
import Layout from './components/Layout';
import { Booking, Room, CleaningStatus, Language, Translations } from './types';
import { ALL_ROOMS, translations } from './constants';

export const AppContext = React.createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations[Language]) => string;
  logout: () => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
  allRooms: Room[];
  cleaningStatuses: Record<string, CleaningStatus>;
  updateCleaningStatus: (roomNumber: string, status: 'Clean' | 'Needs Cleaning') => void;
  runDailyCleaningReset: () => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
}>({} as any);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('isAuthenticated'));
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'th');
  const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem('logoUrl'));
  
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const savedBookings = localStorage.getItem('bookings');
    return savedBookings ? JSON.parse(savedBookings) : [];
  });

  const [cleaningStatuses, setCleaningStatuses] = useState<Record<string, CleaningStatus>>(() => {
    const savedStatuses = localStorage.getItem('cleaningStatuses');
    if (savedStatuses) {
      return JSON.parse(savedStatuses);
    }
    const initialStatuses: Record<string, CleaningStatus> = {};
    ALL_ROOMS.forEach(room => {
      initialStatuses[room.number] = { roomNumber: room.number, status: 'Clean' };
    });
    return initialStatuses;
  });

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);
  
  useEffect(() => {
    localStorage.setItem('cleaningStatuses', JSON.stringify(cleaningStatuses));
  }, [cleaningStatuses]);
  
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated ? 'true' : '');
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (logoUrl) {
        localStorage.setItem('logoUrl', logoUrl);
    } else {
        localStorage.removeItem('logoUrl');
    }
  }, [logoUrl]);

  const login = useCallback((user: string, pass: string) => {
    if (user === 'admin' && pass === 'admin2') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const t = useCallback((key: keyof Translations[Language]) => {
    // FIX: The original implementation could return a number if a numeric key was not found in translations, causing a type mismatch.
    // String() ensures the return type is always a string, satisfying the AppContext type.
    return String(translations[language][key] || key);
  }, [language]);

  const addBooking = useCallback((booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `SR${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBookings(prev => [...prev, newBooking]);
  }, []);

  const updateBooking = useCallback((updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
  }, []);

  const deleteBooking = useCallback((bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  }, []);
  
  const updateCleaningStatus = useCallback((roomNumber: string, status: 'Clean' | 'Needs Cleaning') => {
    setCleaningStatuses(prev => ({
      ...prev,
      [roomNumber]: { ...prev[roomNumber], status }
    }));
  }, []);

  const runDailyCleaningReset = useCallback(() => {
      const today = new Date();
      today.setHours(0,0,0,0);

      const occupiedRoomNumbers = new Set<string>();
      bookings.forEach(booking => {
          const checkIn = new Date(booking.checkIn);
          checkIn.setHours(0,0,0,0);
          const checkOut = new Date(booking.checkOut);
          checkOut.setHours(0,0,0,0);
          if(today >= checkIn && today < checkOut) {
              booking.rooms.forEach(roomNum => occupiedRoomNumbers.add(roomNum));
          }
      });

      const newStatuses = { ...cleaningStatuses };
      let changed = false;
      occupiedRoomNumbers.forEach(roomNumber => {
          if (newStatuses[roomNumber].status !== 'Needs Cleaning') {
              newStatuses[roomNumber].status = 'Needs Cleaning';
              changed = true;
          }
      });
      if (changed) {
          setCleaningStatuses(newStatuses);
      }
  }, [bookings, cleaningStatuses]);

  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} />;
      case 'room-status':
        return <RoomStatusPage setActivePage={setActivePage} />;
      case 'dashboard':
        return <DashboardPage />;
      case 'cleaning':
        return <CleaningPage />;
      case 'receipt':
        return <ReceiptPage />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    logout,
    bookings,
    addBooking,
    updateBooking,
    deleteBooking,
    allRooms: ALL_ROOMS,
    cleaningStatuses,
    updateCleaningStatus,
    runDailyCleaningReset,
    logoUrl,
    setLogoUrl,
  }), [language, t, logout, bookings, addBooking, updateBooking, deleteBooking, cleaningStatuses, updateCleaningStatus, runDailyCleaningReset, logoUrl]);

  if (!isAuthenticated) {
    return (
      <AppContext.Provider value={contextValue}>
        <LoginPage onLogin={login} />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {renderPage()}
      </Layout>
    </AppContext.Provider>
  );
};

export default App;
