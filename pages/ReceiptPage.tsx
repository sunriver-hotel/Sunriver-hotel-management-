import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { Booking } from '../types';
import { Logo, TrashIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';

const ReceiptTemplate: React.FC<{ 
    bookings: Booking[];
    paymentMethod: 'Cash' | 'Transfer';
    paymentDate: string;
}> = ({ bookings, paymentMethod, paymentDate }) => {
    const { allRooms, t } = useContext(AppContext);
    if (bookings.length === 0) return null;

    const mainBooking = bookings[0];
    const receiptDate = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedPaymentDate = new Date(paymentDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const combinedItems = useMemo(() => {
        const roomDetailsMap = new Map(allRooms.map(r => [r.number, r]));
        const groupedItems = new Map<string, { description: string, roomTypeName: string, checkIn: string, checkOut: string, noOfRooms: number, noOfNights: number, unitPrice: number, total: number }>();

        bookings.forEach(b => {
            const nights = Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 3600 * 24)) || 1;
            
            b.rooms.forEach(roomNumber => {
                const room = roomDetailsMap.get(roomNumber);
                if (!room) return;

                const roomTypeName = `${room.view} - ${room.bedType}`;
                const key = `${roomTypeName}_${b.checkIn}_${b.checkOut}`;
                const unitPrice = (b.totalPrice || 800 * b.rooms.length) / (b.rooms.length || 1) / (nights || 1);

                if (groupedItems.has(key)) {
                    const existing = groupedItems.get(key)!;
                    existing.noOfRooms += 1;
                    existing.total += unitPrice * nights;
                } else {
                    groupedItems.set(key, {
                        description: `${roomTypeName}`,
                        roomTypeName: roomTypeName,
                        checkIn: b.checkIn,
                        checkOut: b.checkOut,
                        noOfRooms: 1,
                        noOfNights: nights,
                        unitPrice: unitPrice,
                        total: unitPrice * nights,
                    });
                }
            });
        });

        return Array.from(groupedItems.values());
    }, [bookings, allRooms]);
    
    const totalAmount = combinedItems.reduce((sum, item) => sum + item.total, 0);

    return (
        <div id="printable-receipt" className="p-8 bg-white max-w-4xl mx-auto font-['Sarabun'] text-gray-800">
            <div className="absolute top-0 left-0 w-full h-48 bg-[#e6c872] opacity-20 -z-10" style={{clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0% 100%)'}}></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-[#e6c872] opacity-20 -z-10" style={{clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0% 100%)'}}></div>
            
            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">โรงแรมซันริเวอร์</h1>
                    <h2 className="text-2xl font-semibold">Sunriver Hotel</h2>
                    <p className="text-sm mt-2">หจก. ซันริเวอร์โฮเทล</p>
                    <p className="text-sm">215 หมู่ที่ 1 ถ.อภิบาลบัญชา ต.ท่าอุเทน อ.ท่าอุเทน จ.นครพนม 48120</p>
                    <p className="text-sm">โทรศัพท์: +66 93-152-9564</p>
                    <p className="text-sm">อีเมล: sunriver.thauthen@gmail.com</p>
                    <p className="text-sm">เลขที่ผู้เสียภาษี: 0483568000055</p>
                </div>
                <div className="text-right">
                    <Logo className="justify-end"/>
                    <h3 className="text-2xl font-bold mt-4">ใบเสร็จรับเงิน</h3>
                    <h4 className="text-xl font-semibold">RECEIPT</h4>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-8 mb-8 pb-4 border-b-2 border-[#e6c872]">
                <div>
                    <p><strong className="w-32 inline-block">ชื่อลูกค้า:</strong> {mainBooking.customerName}</p>
                    <p><strong className="w-32 inline-block">ที่อยู่:</strong> {mainBooking.address || ' -'}</p>
                    <p><strong className="w-32 inline-block">โทรศัพท์:</strong> {mainBooking.phone}</p>
                    <p><strong className="w-32 inline-block">เลขที่ผู้เสียภาษี:</strong> {mainBooking.taxId || ' -'}</p>
                </div>
                <div className="text-right">
                    <p><strong className="w-32 inline-block text-left">เลขที่ใบเสร็จ:</strong> {mainBooking.id}</p>
                    <p><strong className="w-32 inline-block text-left">วันที่:</strong> {receiptDate}</p>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead className="border-b-2 border-black">
                    <tr>
                        <th className="text-left py-2">รายการ</th>
                        <th className="text-center py-2">จำนวนห้องพัก</th>
                        <th className="text-center py-2">จำนวนวันที่เข้าพัก</th>
                        <th className="text-right py-2">ราคาต่อห้อง</th>
                        <th className="text-right py-2">รวม</th>
                    </tr>
                </thead>
                <tbody>
                    {combinedItems.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                            <td className="py-2">
                                {item.description}
                                <br />
                                <span className="text-xs text-gray-500">
                                    Check-in: {new Date(item.checkIn).toLocaleDateString('th-TH')} - 
                                    Check-out: {new Date(item.checkOut).toLocaleDateString('th-TH')}
                                </span>
                            </td>
                            <td className="text-center py-2">{item.noOfRooms}</td>
                            <td className="text-center py-2">{item.noOfNights}</td>
                            <td className="text-right py-2">{item.unitPrice.toFixed(2)}</td>
                            <td className="text-right py-2">{item.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="flex justify-between items-start">
                 <div className="text-sm">
                    <p><strong className="w-24 inline-block">หมายเหตุ:</strong> -</p>
                </div>
                <div className="w-1/3">
                    <div className="flex justify-between font-bold text-lg border-t-2 border-b-2 border-black py-2">
                        <span>รวมเงินทั้งหมด (บาท)</span>
                        <span>{totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            

            <footer className="mt-24 text-sm">
                <div className="grid grid-cols-2 gap-8">
                     <div>
                        <p className="font-bold mb-2">{t('payment_information')}</p>
                        <p><strong className="w-20 inline-block">{paymentMethod === 'Cash' ? t('cash') : t('transfer')}:</strong> {totalAmount.toFixed(2)} บาท, วันที่ {formattedPaymentDate}</p>
                    </div>
                    <div className="text-center">
                        <div className="w-48 border-b border-black mx-auto"></div>
                        <p className="mt-2">ผู้มีอำนาจลงนาม</p>
                        <p>(Authorized Signature)</p>
                    </div>
                </div>
                 <div className="text-center mt-12 text-xs text-gray-500 border-t pt-4">
                    <span>093-152-9564</span>
                    <span className="mx-4">|</span>
                    <span>272 หมู่ที่ 3 ต.ท่าอุเทน อ.ท่าอุเทน จ.นครพนม 48120</span>
                </div>
            </footer>
        </div>
    );
};


const ReceiptPage: React.FC = () => {
    const { bookings, t, deleteBooking } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);
    const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer'>('Cash');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredBookings = useMemo(() => {
        const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (!searchTerm) {
            return recentBookings.slice(0, 10);
        }
        return recentBookings.filter(b => 
            b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.phone.includes(searchTerm) ||
            b.checkIn.includes(searchTerm) ||
            b.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bookings, searchTerm]);

    const handleSelectBooking = (booking: Booking, isChecked: boolean) => {
        if (isChecked) {
            setSelectedBookings(prev => [...prev, booking].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
        } else {
            setSelectedBookings(prev => prev.filter(b => b.id !== booking.id));
        }
    }

    const handleDeleteClick = (booking: Booking) => {
        setBookingToDelete(booking);
    };

    const confirmDelete = () => {
        if (bookingToDelete) {
            deleteBooking(bookingToDelete.id);
            setSelectedBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
            setBookingToDelete(null);
        }
    };
    
    const cancelDelete = () => {
        setBookingToDelete(null);
    };
    
    const handlePrint = () => {
        window.print();
    }
    
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md flex flex-col no-print">
                    <h2 className="text-xl font-bold mb-4">{t('generate_receipt')}</h2>
                    <input 
                        type="text"
                        placeholder={t('search_booking')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md mb-4"
                    />
                    
                    <div className="mb-4 border-t pt-4">
                        <h3 className="font-semibold mb-2">{t('payment_information')}</h3>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('payment_method')}</label>
                                <select 
                                    value={paymentMethod} 
                                    onChange={e => setPaymentMethod(e.target.value as 'Cash' | 'Transfer')}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-50"
                                    disabled={selectedBookings.length === 0}
                                >
                                    <option value="Cash">{t('cash')}</option>
                                    <option value="Transfer">{t('transfer')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('payment_date')}</label>
                                <input 
                                    type="date"
                                    value={paymentDate}
                                    onChange={e => setPaymentDate(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-50"
                                    disabled={selectedBookings.length === 0}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto border-t pt-4">
                        <h3 className="font-semibold mb-2">{t('recent_bookings')}</h3>
                        <ul className="space-y-2">
                            {filteredBookings.map(b => (
                                <li key={b.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                                    <label className="flex items-center space-x-3 flex-grow">
                                        <input 
                                          type="checkbox"
                                          checked={selectedBookings.some(sb => sb.id === b.id)}
                                          onChange={(e) => handleSelectBooking(b, e.target.checked)}
                                          className="form-checkbox h-5 w-5 text-[#e6c872] rounded focus:ring-[#e6c872]"
                                        />
                                        <div>
                                            <p className="font-semibold">{b.customerName}</p>
                                            <p className="text-sm text-gray-500">{b.id} - {new Date(b.checkIn).toLocaleDateString()}</p>
                                        </div>
                                    </label>
                                    <button
                                        onClick={() => handleDeleteClick(b)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors ml-2 shrink-0"
                                        aria-label={`Delete booking ${b.id}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-gray-100 p-4 rounded-lg shadow-inner overflow-y-auto">
                     <div className="flex justify-end mb-4 no-print">
                        <button 
                            onClick={handlePrint} 
                            disabled={selectedBookings.length === 0}
                            className="px-4 py-2 bg-[#e6c872] text-white rounded-lg font-semibold hover:bg-amber-500 disabled:bg-gray-400"
                        >
                            {t('print_receipt')}
                        </button>
                    </div>
                    {selectedBookings.length > 0 ? (
                        <ReceiptTemplate 
                            bookings={selectedBookings} 
                            paymentMethod={paymentMethod}
                            paymentDate={paymentDate}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            {t('no_booking_selected')}
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={!!bookingToDelete}
                title={t('delete_booking')}
                message={
                    <>
                        <p>{t('confirm_delete_booking_message')}</p>
                        {bookingToDelete && (
                            <div className="mt-4 p-2 bg-gray-100 rounded border">
                                <p><strong>{t('customer_name')}:</strong> {bookingToDelete.customerName}</p>
                                <p><strong>{t('booking_id')}:</strong> {bookingToDelete.id}</p>
                            </div>
                        )}
                    </>
                }
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </>
    );
};

export default ReceiptPage;