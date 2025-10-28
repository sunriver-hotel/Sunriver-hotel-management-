
import React, { useState, useContext, useMemo, useCallback } from 'react';
import { AppContext } from '../App';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import BookingModal from '../components/BookingModal';
import { Booking, PageProps } from '../types';

const Calendar: React.FC<{ 
  onDateClick: (date: Date) => void,
  bookedCounts: Record<string, number> 
}> = ({ onDateClick, bookedCounts }) => {
  const { t, allRooms } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="border-r border-b border-gray-200"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    const bookedCount = bookedCounts[dateString] || 0;
    const vacantCount = allRooms.length - bookedCount;
    const isFull = vacantCount <= 0;

    calendarDays.push(
      <div 
        key={day} 
        className={`p-2 border-r border-b border-gray-200 cursor-pointer transition-colors ${isFull ? 'bg-red-50' : 'hover:bg-amber-100'}`}
        onClick={() => !isFull && onDateClick(date)}
      >
        <div className="font-semibold text-gray-700">{day}</div>
        <div className="mt-2 text-sm">
          <div className="flex items-center text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span>{vacantCount}</span>
            <span className="hidden lg:inline ml-1">{t('vacant')}</span>
          </div>
          <div className="flex items-center text-red-600">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            <span>{bookedCount}</span>
            <span className="hidden lg:inline ml-1">{t('booked')}</span>
          </div>
        </div>
      </div>
    );
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-6 h-6"/></button>
        <h2 className="text-xl font-bold">{monthName}</h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-6 h-6"/></button>
      </div>
      <div className="grid grid-cols-7 text-center font-semibold text-gray-500 border-t border-l border-gray-200">
        {daysOfWeek.map(day => <div key={day} className="py-2 border-r border-b border-gray-200">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 border-l border-gray-200">
        {calendarDays}
      </div>
    </div>
  );
};

const TodayOverview: React.FC<{ onBookingClick: (booking: Booking) => void }> = ({ onBookingClick }) => {
  const { bookings, t } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { checkIns, checkOuts, inHouse } = useMemo(() => {
    const selected = new Date(selectedDate + 'T00:00:00'); // Ensure it's treated as local date
    const checkIns: Booking[] = [];
    const checkOuts: Booking[] = [];
    const inHouse: Booking[] = [];

    bookings.forEach(booking => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      
      if (checkInDate.toISOString().split('T')[0] === selected.toISOString().split('T')[0]) {
        checkIns.push(booking);
      }
      if (checkOutDate.toISOString().split('T')[0] === selected.toISOString().split('T')[0]) {
        checkOuts.push(booking);
      }
      if (selected >= checkInDate && selected < checkOutDate) {
        inHouse.push(booking);
      }
    });
    return { checkIns, checkOuts, inHouse };
  }, [bookings, selectedDate]);

  const GuestList: React.FC<{ guests: Booking[] }> = ({ guests }) => {
    if (guests.length === 0) {
      return <p className="text-gray-500 italic p-4">{t('no_guests_today')}</p>;
    }
    return (
      <ul className="divide-y divide-gray-200">
        {guests.map(b => (
          <li key={b.id} onClick={() => onBookingClick(b)} className="p-4 hover:bg-gray-50 cursor-pointer">
            <p className="font-semibold text-gray-800">{b.customerName}</p>
            <p className="text-sm text-gray-500">{b.phone}</p>
            <p className="text-sm text-gray-500">Rooms: {b.rooms.join(', ')}</p>
          </li>
        ))}
      </ul>
    );
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{t('today_overview')}</h2>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border rounded-md p-1"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg overflow-hidden">
          <h3 className="bg-green-100 text-green-800 p-3 font-semibold">{t('check_in')} ({checkIns.length})</h3>
          <GuestList guests={checkIns} />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <h3 className="bg-red-100 text-red-800 p-3 font-semibold">{t('check_out')} ({checkOuts.length})</h3>
          <GuestList guests={checkOuts} />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <h3 className="bg-blue-100 text-blue-800 p-3 font-semibold">{t('in_house')} ({inHouse.length})</h3>
          <GuestList guests={inHouse} />
        </div>
      </div>
    </div>
  );
};


const HomePage: React.FC<PageProps> = ({ setActivePage }) => {
  const { bookings, t } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalDate, setModalDate] = useState<Date | null>(null);

  const bookedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach(booking => {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      for (let d = start; d < end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        counts[dateString] = (counts[dateString] || 0) + booking.rooms.length;
      }
    });
    return counts;
  }, [bookings]);

  const handleDateClick = (date: Date) => {
    setSelectedBooking(null);
    setModalDate(date);
    setIsModalOpen(true);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalDate(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setModalDate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{t('booking_overview')}</h1>
        <button onClick={() => handleDateClick(new Date())} className="px-4 py-2 bg-[#e6c872] text-white rounded-lg font-semibold hover:bg-amber-500 transition shadow">
          {t('add_booking')}
        </button>
      </div>

      <Calendar onDateClick={handleDateClick} bookedCounts={bookedCounts} />
      <TodayOverview onBookingClick={handleBookingClick} />
      
      {isModalOpen && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          booking={selectedBooking}
          initialDate={modalDate}
        />
      )}
    </div>
  );
};

export default HomePage;
