import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../App';
import { Booking, Room } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  initialDate?: Date | null;
  initialRoom?: Room | null;
}

const getRoomColor = (view: Room['view']) => {
    switch (view) {
      case 'River view':
        return 'bg-blue-100 hover:bg-blue-200';
      case 'Standard view':
        return 'bg-green-100 hover:bg-green-200';
      case 'Cottage':
        return 'bg-purple-100 hover:bg-purple-200';
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
};

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, booking, initialDate, initialRoom }) => {
  const { addBooking, updateBooking, allRooms, bookings, t } = useContext(AppContext);

  const [formData, setFormData] = useState<Omit<Booking, 'id' | 'createdAt'>>({
    customerName: '',
    phone: '',
    checkIn: initialDate ? initialDate.toISOString().split('T')[0] : '',
    checkOut: initialDate ? new Date(initialDate.getTime() + 86400000).toISOString().split('T')[0] : '',
    rooms: initialRoom ? [initialRoom.number] : [],
    status: 'Unpaid',
    depositAmount: 0,
    totalPrice: 0,
    email: '',
    address: '',
    taxId: '',
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        ...booking,
        checkIn: booking.checkIn.split('T')[0],
        checkOut: booking.checkOut.split('T')[0],
      });
    } else {
      const checkInDate = initialDate || new Date();
      const checkOutDate = new Date(checkInDate.getTime() + 86400000);
      setFormData({
        customerName: '',
        phone: '',
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
        rooms: initialRoom ? [initialRoom.number] : [],
        status: 'Unpaid',
        depositAmount: 0,
        totalPrice: initialRoom ? 800 : 0,
        email: '',
        address: '',
        taxId: '',
      });
    }
  }, [booking, initialDate, initialRoom]);
  
  const availableRooms = useMemo(() => {
    const checkInTime = new Date(formData.checkIn).getTime();
    const checkOutTime = new Date(formData.checkOut).getTime();
    
    if (!formData.checkIn || !formData.checkOut || checkInTime >= checkOutTime) {
      return [];
    }

    const bookedRoomNumbers = new Set<string>();
    bookings.forEach(b => {
      // Exclude the current booking being edited
      if (booking && b.id === booking.id) return;

      const existingCheckInTime = new Date(b.checkIn).getTime();
      const existingCheckOutTime = new Date(b.checkOut).getTime();
      
      // Check for overlapping dates
      if (checkInTime < existingCheckOutTime && checkOutTime > existingCheckInTime) {
        b.rooms.forEach(roomNum => bookedRoomNumbers.add(roomNum));
      }
    });

    return allRooms.filter(room => !bookedRoomNumbers.has(room.number));
  }, [formData.checkIn, formData.checkOut, bookings, allRooms, booking]);
  
  const handleRoomToggle = (roomNumber: string) => {
    setFormData(prev => {
        const newRooms = prev.rooms.includes(roomNumber)
            ? prev.rooms.filter(r => r !== roomNumber)
            : [...prev.rooms, roomNumber];
        
        const nights = Math.max(1, (new Date(prev.checkOut).getTime() - new Date(prev.checkIn).getTime()) / (1000 * 3600 * 24));
        const newPrice = newRooms.length * 800 * nights;

        return { ...prev, rooms: newRooms.sort((a,b) => parseInt(a) - parseInt(b)), totalPrice: newPrice };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rooms.length === 0) {
      alert(t('select_at_least_one_room'));
      return;
    }
    if (booking) {
      updateBooking({ ...formData, id: booking.id, createdAt: booking.createdAt });
    } else {
      addBooking(formData);
    }
    onClose();
  };

  if (!isOpen) return null;
  
  const nights = Math.max(0, (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 3600 * 24));
  useEffect(() => {
    const newPrice = formData.rooms.length * 800 * nights;
    setFormData(prev => ({ ...prev, totalPrice: newPrice }));
  }, [formData.rooms.length, nights]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-6 border-b shrink-0 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{booking ? t('edit_booking') : t('add_booking')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">&times;</button>
        </header>
        <form id="booking-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-4">{t('customer_info')}</h3>
            <div><label className="text-sm font-medium text-gray-600">{t('customer_name')} <span className="text-red-500">*</span></label><input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
            <div><label className="text-sm font-medium text-gray-600">{t('phone')} <span className="text-red-500">*</span></label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
            <div><label className="text-sm font-medium text-gray-600">{t('email')}</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div>
            <div><label className="text-sm font-medium text-gray-600">{t('address')}</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div>
            <div><label className="text-sm font-medium text-gray-600">{t('tax_id')}</label><input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-4">{t('booking_details')}</h3>
            <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-gray-600">{t('check_in_date')}</label><input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
                  <div><label className="text-sm font-medium text-gray-600">{t('check_out_date')}</label><input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required /></div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">{t('rooms')}</label>
              <div className="p-3 border rounded-md max-h-40 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-1">
                {availableRooms.length > 0 ? availableRooms.map(room => {
                    const isSelected = formData.rooms.includes(room.number);
                    const roomColorClass = isSelected ? 'bg-[#e6c872] text-white border-[#e6c872] shadow-sm' : `${getRoomColor(room.view)} text-gray-800 border-gray-200`;
                    
                    return (
                        <button type="button" key={room.number} onClick={() => handleRoomToggle(room.number)} className={`p-2 border rounded text-sm font-medium transition-all duration-200 ${roomColorClass}`}>
                            <span className="flex items-center justify-center relative">
                                {room.number}
                                {room.bedType === 'Twin bed' && <span className="absolute -top-1.5 -right-1.5 text-amber-600 text-lg leading-none">*</span>}
                            </span>
                        </button>
                    )
                }) : <p className="text-sm text-gray-500 col-span-full">{t('no_rooms_available')}</p>}
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-600">{t('booking_status')}</label><select name="status" value={formData.status} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" required><option value="Unpaid">{t('unpaid')}</option><option value="Deposit">{t('deposit')}</option><option value="Paid">{t('paid')}</option></select></div>
                {formData.status === 'Deposit' && (
                    <div><label className="text-sm font-medium text-gray-600">{t('deposit_amount')}</label><input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div>
                )}
            </div>
             <div><label className="text-sm font-medium text-gray-600">{t('total_price')}</label><input type="number" name="totalPrice" value={formData.totalPrice || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" /></div>
          </div>
        </form>
        <footer className="p-4 bg-gray-50 border-t flex justify-end shrink-0">
          <div className="space-x-4">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold text-gray-700 transition-colors">{t('close')}</button>
            <button type="submit" form="booking-form" className="px-5 py-2 bg-[#e6c872] text-white rounded-lg hover:bg-amber-500 font-semibold shadow-sm transition-colors">{t('save_booking')}</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BookingModal;
