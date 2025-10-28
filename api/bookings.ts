
import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../lib/prisma';

// Helper to format bookings for the frontend
const formatBookings = (dbBookings: any[]) => {
  const groupedBookings = dbBookings.reduce((acc, b) => {
    // FIX: Use snake_case properties to match the database schema.
    const groupId = b.booking_group_id;
    if (!acc[groupId]) {
      acc[groupId] = {
        id: groupId,
        customerName: b.customer.customer_name,
        phone: b.customer.phone,
        email: b.customer.email,
        address: b.customer.address,
        taxId: b.customer.tax_id,
        checkIn: b.check_in_date.toISOString(),
        checkOut: b.check_out_date.toISOString(),
        status: b.status,
        depositAmount: b.deposit,
        createdAt: b.created_at.toISOString(),
        rooms: [],
        totalPrice: 0,
      };
    }
    acc[groupId].rooms.push(b.room.room_number);
    const nights = Math.ceil((new Date(b.check_out_date).getTime() - new Date(b.check_in_date).getTime()) / (1000 * 3600 * 24)) || 1;
    acc[groupId].totalPrice += Number(b.price_per_night) * nights;
    
    return acc;
  }, {} as Record<string, any>);
  
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

  const booking_group_id = `SR${Date.now()}`;
  const price_per_night = (totalPrice / rooms.length) / (Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)) || 1);

  const newBooking = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: { customerName: customerName, phone, email, address, taxId: taxId },
    });

    const dbRooms = await tx.room.findMany({
        where: { roomNumber: { in: rooms } }
    });
    
    if(dbRooms.length !== rooms.length) {
        throw new Error("One or more rooms not found");
    }

    const bookingCreates = dbRooms.map((room) => tx.booking.create({
      data: {
        bookingGroupId: booking_group_id,
        customerId: customer.customerId,
        roomId: room.roomId,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        status,
        deposit: depositAmount,
        pricePerNight: price_per_night,
      }
    }));
    await Promise.all(bookingCreates);

    return { id: booking_group_id, ...req.body, rooms: rooms, createdAt: new Date().toISOString() };
  });

  res.status(201).json({ booking: newBooking });
}

// PUT /api/bookings?id={bookingGroupId}
async function handlePUT(req: VercelRequest, res: VercelResponse) {
    const { id: booking_group_id } = req.query;
    const { customerName, phone, email, address, taxId, checkIn, checkOut, rooms, status, depositAmount, totalPrice } = req.body;

    if (!booking_group_id || typeof booking_group_id !== 'string') {
        return res.status(400).json({ message: 'Booking ID is required.' });
    }

    const updatedBookingData = await prisma.$transaction(async (tx) => {
        const existingBooking = await tx.booking.findFirst({
            where: { bookingGroupId: booking_group_id },
            select: { customerId: true }
        });

        if (!existingBooking) {
            throw new Error("Booking not found");
        }

        await tx.customer.update({
            where: { customerId: existingBooking.customerId },
            data: { customerName: customerName, phone, email, address, taxId: taxId },
        });

        await tx.booking.deleteMany({
            where: { bookingGroupId: booking_group_id }
        });

        const dbRooms = await tx.room.findMany({
            where: { roomNumber: { in: rooms } }
        });
        if(dbRooms.length !== rooms.length) {
            throw new Error("One or more rooms not found");
        }
        
        const price_per_night = (totalPrice / rooms.length) / (Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)) || 1);

        const bookingCreates = dbRooms.map((room) => tx.booking.create({
            data: {
              bookingGroupId: booking_group_id,
              customerId: existingBooking.customerId,
              roomId: room.roomId,
              checkInDate: new Date(checkIn),
              checkOutDate: new Date(checkOut),
              status,
              deposit: depositAmount,
              pricePerNight: price_per_night,
            }
        }));
        await Promise.all(bookingCreates);

        return { id: booking_group_id, ...req.body };
    });
    
    res.status(200).json({ booking: updatedBookingData });
}


// DELETE /api/bookings?id={bookingGroupId}
async function handleDELETE(req: VercelRequest, res: VercelResponse) {
    const { id: booking_group_id } = req.query;

    if (!booking_group_id || typeof booking_group_id !== 'string') {
        return res.status(400).json({ message: 'Booking ID is required.' });
    }

    await prisma.$transaction(async (tx) => {
        const bookingsToDelete = await tx.booking.findMany({
            where: { bookingGroupId: booking_group_id },
            select: { customerId: true }
        });

        if (bookingsToDelete.length === 0) {
            return;
        }

        const customerId = bookingsToDelete[0].customerId;

        await tx.booking.deleteMany({
            where: { bookingGroupId: booking_group_id }
        });

        const otherBookings = await tx.booking.count({
            where: { customerId }
        });

        if (otherBookings === 0) {
            await tx.customer.delete({
                where: { customerId }
            });
        }
    });

    res.status(200).json({ message: 'Booking deleted successfully.' });
}