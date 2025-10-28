
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RoomStatusPage from './pages/RoomStatusPage';
import DashboardPage from './pages/DashboardPage';
import CleaningPage from './pages/CleaningPage';
import ReceiptPage from './pages/ReceiptPage';
import Layout from './components/Layout';
import { Booking, Room, CleaningStatus, Language, Translations } from './types';
import { translations } from './constants';

export const AppContext = React.createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations[Language]) => string;
  logout: () => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
  updateBooking: (booking: Booking) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  allRooms: Room[];
  cleaningStatuses: Record<string, CleaningStatus>;
  updateCleaningStatus: (roomNumber: string, status: 'Clean' | 'Needs Cleaning') => Promise<void>;
  runDailyCleaningReset: () => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
}>({} as any);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!sessionStorage.getItem('isAuthenticated'));
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'th');
  const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem('logoUrl'));
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [cleaningStatuses, setCleaningStatuses] = useState<Record<string, CleaningStatus>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Data fetching from API
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [bookingsRes, roomsRes, cleaningRes] = await Promise.all([
            fetch('/api/bookings'),
            fetch('/api/rooms'),
            fetch('/api/cleaning-statuses')
          ]);

          const bookingsData = await bookingsRes.json();
          const roomsData = await roomsRes.json();
          const cleaningData = await cleaningRes.json();
          
          setBookings(bookingsData.bookings || []);
          setAllRooms(roomsData.rooms || []);
          
          const cleaningMap: Record<string, CleaningStatus> = {};
          (cleaningData.statuses || []).forEach((s: any) => {
            cleaningMap[s.room.room_number] = { roomNumber: s.room.room_number, status: s.status };
          });
          setCleaningStatuses(cleaningMap);

        } catch (error) {
          console.error("Failed to fetch initial data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  useEffect(() => {
    if (isAuthenticated) {
        sessionStorage.setItem('isAuthenticated', 'true');
    } else {
        sessionStorage.removeItem('isAuthenticated');
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (logoUrl) {
        localStorage.setItem('logoUrl', logoUrl);
    } else {
        localStorage.removeItem('logoUrl');
    }
  }, [logoUrl]);

  const login = useCallback(async (user: string, pass: string) => {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        if (response.ok) {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Login failed:", error);
        return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const t = useCallback((key: keyof Translations[Language]) => {
    return String(translations[language][key] || key);
  }, [language]);

  const addBooking = useCallback(async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        if (!response.ok) throw new Error('Failed to add booking');
        const newBooking = await response.json();
        setBookings(prev => [...prev, newBooking.booking]);
    } catch (error) {
        console.error("Error adding booking:", error);
    }
  }, []);

  const updateBooking = useCallback(async (updatedBooking: Booking) => {
    try {
        const response = await fetch(`/api/bookings?id=${updatedBooking.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBooking)
        });
        if (!response.ok) throw new Error('Failed to update booking');
        const result = await response.json();
        setBookings(prev => prev.map(b => b.id === result.booking.id ? result.booking : b));
    } catch (error) {
        console.error("Error updating booking:", error);
    }
  }, []);

  const deleteBooking = useCallback(async (bookingId: string) => {
    try {
        const response = await fetch(`/api/bookings?id=${bookingId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete booking');
        setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (error) {
        console.error("Error deleting booking:", error);
    }
  }, []);
  
  const updateCleaningStatus = useCallback(async (roomNumber: string, status: 'Clean' | 'Needs Cleaning') => {
    try {
        const response = await fetch('/api/cleaning-statuses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomNumber, status })
        });
        if (!response.ok) throw new Error('Failed to update status');
        setCleaningStatuses(prev => ({
            ...prev,
            [roomNumber]: { ...prev[roomNumber], status }
        }));
    } catch (error) {
        console.error("Error updating cleaning status:", error);
    }
  }, []);

  const runDailyCleaningReset = useCallback(() => {
      // This would be triggered by a cron job on the server in a real deployment.
      // The client-side simulation is no longer needed.
      console.log("Daily cleaning reset should be handled by a server-side cron job.");
  }, []);

  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    if (isLoading && isAuthenticated) {
      return <div className="flex justify-center items-center h-full">Loading...</div>;
    }
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
    allRooms,
    cleaningStatuses,
    updateCleaningStatus,
    runDailyCleaningReset,
    logoUrl,
    setLogoUrl,
  }), [language, t, logout, bookings, addBooking, updateBooking, deleteBooking, allRooms, cleaningStatuses, updateCleaningStatus, runDailyCleaningReset, logoUrl]);

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
