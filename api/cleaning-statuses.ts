
import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../lib/prisma';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'PUT':
        await handlePUT(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// GET /api/cleaning-statuses
async function handleGET(req: VercelRequest, res: VercelResponse) {
  const statuses = await prisma.cleaningStatus.findMany({
    include: {
      room: {
        select: {
          roomNumber: true
        }
      }
    }
  });
  res.status(200).json({ statuses });
}

// PUT /api/cleaning-statuses
async function handlePUT(req: VercelRequest, res: VercelResponse) {
  const { roomNumber, status } = req.body;

  if (!roomNumber || !status || !['Clean', 'Needs Cleaning'].includes(status)) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  
  const room = await prisma.room.findUnique({ where: { roomNumber: roomNumber } });
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const updatedStatus = await prisma.cleaningStatus.update({
    where: { roomId: room.roomId },
    data: { status },
  });

  res.status(200).json({ status: updatedStatus });
}