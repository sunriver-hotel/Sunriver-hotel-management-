import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App';
import ConfirmationModal from '../components/ConfirmationModal';


const CleaningPage: React.FC = () => {
  const { allRooms, cleaningStatuses, updateCleaningStatus, bookings, t } = useContext(AppContext);
  const [confirming, setConfirming] = useState<{roomNumber: string, newStatus: 'Clean' | 'Needs Cleaning'} | null>(null);

  const roomOccupancyStatuses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const statuses: Record<string, string[]> = {};
    allRooms.forEach(room => statuses[room.number] = [t('vacant')]);
    
    bookings.forEach(b => {
      const checkInDate = b.checkIn.split('T')[0];
      const checkOutDate = b.checkOut.split('T')[0];
      const isInHouse = today >= checkInDate && today < checkOutDate;

      b.rooms.forEach(roomNum => {
        if (!statuses[roomNum]) return;
        
        if (statuses[roomNum][0] === t('vacant')) {
            statuses[roomNum] = [];
        }

        if (checkInDate === today) statuses[roomNum].push(t('check_in'));
        if (checkOutDate === today) statuses[roomNum].push(t('check_out'));
        if (isInHouse) statuses[roomNum].push(t('in_house'));
        
        statuses[roomNum] = [...new Set(statuses[roomNum])];
        if(statuses[roomNum].length === 0) statuses[roomNum].push(t('vacant'))
      });
    });
    return statuses;
  }, [bookings, allRooms, t]);

  const handleStatusChange = (roomNumber: string, currentStatus: 'Clean' | 'Needs Cleaning') => {
    const newStatus = currentStatus === 'Clean' ? 'Needs Cleaning' : 'Clean';
    setConfirming({ roomNumber, newStatus });
  };
  
  const confirmChange = () => {
      if (confirming) {
          updateCleaningStatus(confirming.roomNumber, confirming.newStatus);
          setConfirming(null);
      }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('room_no')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cleaning_status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('occupancy_status')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allRooms.map(room => {
                const cleaningStatus = cleaningStatuses[room.number]?.status || 'Clean';
                const isClean = cleaningStatus === 'Clean';
                const occupancy = roomOccupancyStatuses[room.number];
                
                return (
                  <tr key={room.number}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{room.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleStatusChange(room.number, cleaningStatus)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full w-40 text-center transition-colors ${
                        isClean 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}>
                        {isClean ? t('clean') : t('needs_cleaning')}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                        {occupancy.map((status, index) => {
                             let colorClass = 'bg-gray-100 text-gray-800';
                             if (status === t('check_in')) colorClass = 'bg-blue-100 text-blue-800';
                             if (status === t('check_out')) colorClass = 'bg-yellow-100 text-yellow-800';
                             if (status === t('in_house')) colorClass = 'bg-indigo-100 text-indigo-800';
                             if (status === t('vacant')) colorClass = 'bg-gray-100 text-gray-800';
                            return (
                                <span key={index} className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>{status}</span>
                            )
                        })}
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {confirming && (
          <ConfirmationModal 
            isOpen={!!confirming}
            title={t('confirm_cleaning_status_change')}
            message={t('confirm_cleaning_status_message').replace('{roomNumber}', confirming.roomNumber).replace('{status}', t(confirming.newStatus.toLowerCase().replace(' ', '_')))}
            onConfirm={confirmChange}
            onCancel={() => setConfirming(null)}
            />
      )}
    </div>
  );
};

export default CleaningPage;
