import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../lib/prisma';
import { cuid } from '@prisma/client/runtime/library';

// Helper to format bookings for the frontend
const formatBookings = (dbBookings: any[]) => {
  const groupedBookings = dbBookings.reduce((acc, b) => {
    const groupId = b.bookingGroupId;
    if (!acc[groupId]) {
      acc[groupId] = {
        id: groupId,
        customerName: b.customer.customerName,
        phone: b.customer.phone,
        email: b.customer.email,
        address: b.customer.address,
        taxId: b.customer.taxId,
        checkIn: b.checkInDate.toISOString(),
        checkOut: b.checkOutDate.toISOString(),
        status: b.status,
        depositAmount: b.deposit,
        createdAt: b.createdAt.toISOString(),
        rooms: [],
        totalPrice: 0,
      };
    }
    acc[groupId].rooms.push(b.room.roomNumber);
    const nights = Math.ceil((new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime()) / (1000 * 3600 * 24)) || 1;
    acc[groupId].totalPrice += Number(b.pricePerNight) * nights;
    
    return acc;
  }, {} as Record<string, any>);
  
  // FIX: Explicitly type sort parameters as 'any' to resolve type inference error.
  return Object.values(groupedBookings).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'PUT':
        await handlePUT(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// GET /api/bookings
async function handleGET(req: VercelRequest, res: VercelResponse) {
  const dbBookings = await prisma.booking.findMany({
    include: {
      customer: true,
      room: true,
    },
    orderBy: {
        createdAt: 'desc'
    }
  });
  const formatted = formatBookings(dbBookings);
  res.status(200).json({ bookings: formatted });
}

// POST /api/bookings
async function handlePOST(req: VercelRequest, res: VercelResponse) {
  const { customerName, phone, email, address, taxId, checkIn, checkOut, rooms, status, depositAmount, totalPrice } = req.body;
  
  if (!customerName || !phone || !checkIn || !checkOut || !rooms || !rooms.length) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const bookingGroupId = `SR${Date.now()}`;
  const pricePerNight = (totalPrice / rooms.length) / (Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)) || 1);

  const newBooking = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: { customerName, phone, email, address, taxId },
    });

    const dbRooms = await tx.room.findMany({
        where: { roomNumber: { in: rooms } }
    });
    
    if(dbRooms.length !== rooms.length) {
        throw new Error("One or more rooms not found");
    }

    const bookingCreates = dbRooms.map(room => tx.booking.create({
      data: {
        bookingGroupId,
        customerId: customer.customerId,
        roomId: room.roomId,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        status,
        deposit: depositAmount,
        pricePerNight: pricePerNight,
      }
    }));
    await Promise.all(bookingCreates);

    return { id: bookingGroupId, ...req.body, rooms: rooms, createdAt: new Date().toISOString() };
  });

  res.status(201).json({ booking: newBooking });
}

// PUT /api/bookings?id={bookingGroupId}
async function handlePUT(req: VercelRequest, res: VercelResponse) {
    const { id: bookingGroupId } = req.query;
    const { customerName, phone, email, address, taxId, checkIn, checkOut, rooms, status, depositAmount, totalPrice } = req.body;

    if (!bookingGroupId || typeof bookingGroupId !== 'string') {
        return res.status(400).json({ message: 'Booking ID is required.' });
    }

    const updatedBookingData = await prisma.$transaction(async (tx) => {
        // Find existing booking entries to get customerId
        const existingBooking = await tx.booking.findFirst({
            where: { bookingGroupId },
            select: { customerId: true }
        });

        if (!existingBooking) {
            throw new Error("Booking not found");
        }

        // 1. Update customer information
        await tx.customer.update({
            where: { customerId: existingBooking.customerId },
            data: { customerName, phone, email, address, taxId },
        });

        // 2. Delete old room entries for this booking group
        await tx.booking.deleteMany({
            where: { bookingGroupId }
        });

        // 3. Create new room entries
        const dbRooms = await tx.room.findMany({
            where: { roomNumber: { in: rooms } }
        });
        if(dbRooms.length !== rooms.length) {
            throw new Error("One or more rooms not found");
        }
        
        const pricePerNight = (totalPrice / rooms.length) / (Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)) || 1);

        const bookingCreates = dbRooms.map(room => tx.booking.create({
            data: {
              bookingGroupId,
              customerId: existingBooking.customerId,
              roomId: room.roomId,
              checkInDate: new Date(checkIn),
              checkOutDate: new Date(checkOut),
              status,
              deposit: depositAmount,
              pricePerNight: pricePerNight,
            }
        }));
        await Promise.all(bookingCreates);

        return { id: bookingGroupId, ...req.body };
    });
    
    res.status(200).json({ booking: updatedBookingData });
}


// DELETE /api/bookings?id={bookingGroupId}
async function handleDELETE(req: VercelRequest, res: VercelResponse) {
    const { id: bookingGroupId } = req.query;

    if (!bookingGroupId || typeof bookingGroupId !== 'string') {
        return res.status(400).json({ message: 'Booking ID is required.' });
    }

    // In a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
        const bookingsToDelete = await tx.booking.findMany({
            where: { bookingGroupId },
            select: { customerId: true }
        });

        if (bookingsToDelete.length === 0) {
            // If booking is already deleted, just return success
            return;
        }

        const customerId = bookingsToDelete[0].customerId;

        // Delete all booking entries for the group
        await tx.booking.deleteMany({
            where: { bookingGroupId }
        });

        // Check if the customer has any other bookings
        const otherBookings = await tx.booking.count({
            where: { customerId }
        });

        // If no other bookings, delete the customer
        if (otherBookings === 0) {
            await tx.customer.delete({
                where: { customerId }
            });
        }
    });

    res.status(200).json({ message: 'Booking deleted successfully.' });
}
