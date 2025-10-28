
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
        // Sort numerically, not lexicographically
        roomId: 'asc',
      },
    });

    const formattedRooms = rooms.map(r => ({
        number: r.roomNumber,
        floor: r.floor,
        view: r.roomType,
        bedType: r.bedType,
    }));

    res.status(200).json({ rooms: formattedRooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
