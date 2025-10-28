
import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../lib/prisma';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        // FIX: Use snake_case 'room_id' to match the database schema.
        room_id: 'asc',
      },
    });

    // FIX: Use snake_case properties to match the database schema.
    const formattedRooms = rooms.map((r: any) => ({
        number: r.room_number,
        floor: r.floor,
        view: r.room_type,
        bedType: r.bed_type,
    }));

    res.status(200).json({ rooms: formattedRooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
