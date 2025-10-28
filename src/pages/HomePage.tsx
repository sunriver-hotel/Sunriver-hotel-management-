import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
// FIX: Imported BedIcon
import { ChevronLeftIcon, ChevronRightIcon, LogInIcon, LogoutIcon, BedIcon } from '../components/Icons';
import BookingModal from '../components/BookingModal';
import { Booking, PageProps } from '../types';

const Calendar: React.FC<{ 
  onDateClick: (date: Date) => void,
  bookedCounts: Record<string, number> 
}> = ({ onDateClick, bookedCounts }) => {
  const { t, allRooms } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString(t('home') === 'Home' ? 'en-US' : 'th-TH', { month: 'long', year: 'numeric' });
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="border-r border-b"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    const bookedCount = bookedCounts[dateString] || 0;
    const vacantCount = allRooms.length - bookedCount;
    const isFull = vacantCount <= 0;
    const isToday = isCurrentMonth && day === today.getDate();

    calendarDays.push(
      <div 
        key={day} 
        className={`relative p-2 border-r border-b cursor-pointer transition-colors group ${isFull ? 'bg-red-50 text-gray-400' : 'hover:bg-amber-100'}`}
        onClick={() => !isFull && onDateClick(date)}
      >
        <div className={`flex items-center justify-center font-semibold text-gray-700 w-7 h-7 rounded-full transition-colors ${isToday ? 'bg-[#e6c872] text-white' : 'group-hover:text-black'}`}>{day}</div>
        <div className="mt-2 text-sm space-y-1">
          <div className="flex items-center text-green-600">
            <span className="font-semibold">{vacantCount}</span>
            <span className="hidden lg:inline ml-1 opacity-70">{t('vacant')}</span>
          </div>
          <div className="flex items-center text-red-600">
            <span className="font-semibold">{bookedCount}</span>
            <span className="hidden lg:inline ml-1 opacity-70">{t('booked')}</span>
          </div>
        </div>
      </div>
    );
  }

  const daysOfWeek = t('home') === 'Home' 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{monthName}</h2>
        <div className="flex items-center space-x-2">
            <button onClick={goToToday} className="px-3 py-1.5 text-sm font-semibold border rounded-md hover:bg-gray-100 transition-colors">Today</button>
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-6 h-6"/></button>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-6 h-6"/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center font-semibold text-gray-500 border-t border-l">
        {daysOfWeek.map(day => <div key={day} className="py-2 border-r border-b bg-gray-50">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 border-l text-sm">
        {calendarDays}
      </div>
    </div>
  );
};

const TodayOverview: React.FC<{ onBookingClick: (booking: Booking) => void }> = ({ onBookingClick }) => {
  const { bookings, t } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { checkIns, checkOuts, inHouse } = useMemo(() => {
    const checkIns: Booking[] = [];
    const checkOuts: Booking[] = [];
    const inHouse: Booking[] = [];

    bookings.forEach(booking => {
      const checkInDate = booking.checkIn.split('T')[0];
      const checkOutDate = booking.checkOut.split('T')[0];
      
      if (checkInDate === selectedDate) checkIns.push(booking);
      if (checkOutDate === selectedDate) checkOuts.push(booking);
      if (selectedDate >= checkInDate && selectedDate < checkOutDate) inHouse.push(booking);
    });
    return { checkIns, checkOuts, inHouse };
  }, [bookings, selectedDate]);

  const GuestList: React.FC<{ guests: Booking[] }> = ({ guests }) => {
    if (guests.length === 0) {
      return <p className="text-gray-500 italic px-4 py-6 text-center">{t('no_guests_today')}</p>;
    }
    return (
      <ul className="divide-y divide-gray-100">
        {guests.map(b => (
          <li key={b.id} onClick={() => onBookingClick(b)} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
            <p className="font-semibold text-gray-800">{b.customerName}</p>
            <p className="text-sm text-gray-500">Rooms: {b.rooms.join(', ')}</p>
          </li>
        ))}
      </ul>
    );
  };
  
  const OverviewCard: React.FC<{title: string, count: number, icon: React.ReactNode, children: React.ReactNode, color: string}> = ({title, count, icon, children, color}) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className={`flex items-center p-4 border-b ${color}`}>
            {icon}
            <h3 className="ml-3 font-semibold text-lg">{title}</h3>
            <span className="ml-auto font-bold text-xl">{count}</span>
        </div>
        <div className="overflow-y-auto">{children}</div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t('today_overview')}</h2>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border rounded-md p-2 bg-white shadow-sm mt-2 sm:mt-0"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OverviewCard title={t('check_in')} count={checkIns.length} icon={<LogInIcon className="w-6 h-6 text-green-600"/>} color="bg-green-50 border-green-200">
            <GuestList guests={checkIns} />
        </OverviewCard>
        <OverviewCard title={t('check_out')} count={checkOuts.length} icon={<LogoutIcon className="w-6 h-6 text-red-600"/>} color="bg-red-50 border-red-200">
            <GuestList guests={checkOuts} />
        </OverviewCard>
         <OverviewCard title={t('in_house')} count={inHouse.length} icon={<BedIcon className="w-6 h-6 text-blue-600"/>} color="bg-blue-50 border-blue-200">
            <GuestList guests={inHouse} />
        </OverviewCard>
      </div>
    </div>
  );
};

const HomePage: React.FC<PageProps> = () => {
  const { bookings, t } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalDate, setModalDate] = useState<Date | null>(null);

  const bookedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach(booking => {
      let currentDate = new Date(booking.checkIn);
      const endDate = new Date(booking.checkOut);
      while(currentDate < endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        counts[dateString] = (counts[dateString] || 0) + booking.rooms.length;
        currentDate.setDate(currentDate.getDate() + 1);
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
        {/* The title is handled in Layout now */}
        <div></div>
        <button onClick={() => handleDateClick(new Date())} className="px-4 py-2 bg-[#e6c872] text-white rounded-lg font-semibold hover:bg-amber-500 transition shadow-md">
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