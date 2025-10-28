import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPage: React.FC = () => {
  const { bookings, allRooms, t } = useContext(AppContext);

  const monthlyOccupancy = useMemo(() => {
    const data: { [key: string]: { name: string; occupancy: number } } = {};
    const today = new Date();
    
    for(let i=11; i>=0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        data[monthName] = { name: monthName, occupancy: 0 };
    }

    bookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn);
      const daysInBooking = (new Date(booking.checkOut).getTime() - checkIn.getTime()) / (1000 * 3600 * 24);
      
      const monthName = checkIn.toLocaleString('default', { month: 'short', 'year': 'numeric' });
      if(data[monthName]) {
          data[monthName].occupancy += (daysInBooking * booking.rooms.length);
      }
    });

    return Object.values(data);
  }, [bookings]);
  
  const roomPopularity = useMemo(() => {
      const roomCounts: Record<string, number> = {};
      allRooms.forEach(r => roomCounts[r.number] = 0);
      
      bookings.forEach(booking => {
          booking.rooms.forEach(roomNum => {
              if (roomCounts.hasOwnProperty(roomNum)) {
                  roomCounts[roomNum]++;
              }
          });
      });

      return Object.entries(roomCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a,b) => b.count - a.count)
        .slice(0, 10);
  }, [bookings, allRooms]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Monthly Occupancy (Room-Nights)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyOccupancy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="occupancy" fill="#e6c872" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Top 10 Popular Rooms</h2>
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roomPopularity} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={50} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Bookings" fill="#e6c872" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
