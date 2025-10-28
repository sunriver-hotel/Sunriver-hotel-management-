import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../App';
// FIX: Import PageProps to define component props
import { Booking, Room, PageProps } from '../types';
import BookingModal from '../components/BookingModal';

type SortKey = 'room_no' | 'room_type' | 'bed_type';

// FIX: Add PageProps to allow passing setActivePage from App component
const RoomStatusPage: React.FC<PageProps> = () => {
  const { allRooms, bookings, t } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortKey, setSortKey] = useState<SortKey>('room_no');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const roomStatuses = useMemo(() => {
    const targetDateStr = selectedDate;
    return allRooms.map(room => {
      const booking = bookings.find(b => {
        const checkInStr = b.checkIn.split('T')[0];
        const checkOutStr = b.checkOut.split('T')[0];
        return targetDateStr >= checkInStr && targetDateStr < checkOutStr && b.rooms.includes(room.number);
      });
      return { room, booking };
    });
  }, [allRooms, bookings, selectedDate]);

  const sortedRooms = useMemo(() => {
    return [...roomStatuses].sort((a, b) => {
      switch (sortKey) {
        case 'room_type':
          return a.room.view.localeCompare(b.room.view) || parseInt(a.room.number) - parseInt(b.room.number);
        case 'bed_type':
          return a.room.bedType.localeCompare(b.room.bedType) || parseInt(a.room.number) - parseInt(b.room.number);
        case 'room_no':
        default:
          return parseInt(a.room.number) - parseInt(b.room.number);
      }
    });
  }, [roomStatuses, sortKey]);
  
  const handleRoomClick = (room: Room, booking?: Booking) => {
    if (!booking) {
      setSelectedRoom(room);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-lg">
        <div></div>
        <div className="flex items-center space-x-4">
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
            className="border rounded-md p-2 bg-white"
          />
          <div className="flex items-center space-x-2">
            <label className="text-gray-600">{t('sort_by')}</label>
            <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} className="border rounded-md p-2 bg-white">
              <option value="room_no">{t('room_no')}</option>
              <option value="room_type">{t('room_type')}</option>
              <option value="bed_type">{t('bed_type')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
        {sortedRooms.map(({ room, booking }) => (
          <div 
            key={room.number}
            onClick={() => handleRoomClick(room, booking)}
            className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 ${
              booking ? 'cursor-default' : 'cursor-pointer hover:shadow-2xl'
            }`}
          >
            <div className={`h-2 ${booking ? 'bg-red-400' : 'bg-green-400'}`}></div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">{room.number}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  booking ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {booking ? t('booked') : t('vacant')}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>{room.view}</p>
                <p>{room.bedType}</p>
              </div>
              {booking && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
                  <p className="font-semibold truncate">{booking.customerName}</p>
                  <p>{booking.phone}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
       {isModalOpen && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          booking={null}
          initialDate={new Date(selectedDate + 'T00:00:00')}
          initialRoom={selectedRoom}
        />
      )}
    </div>
  );
};

export default RoomStatusPage;