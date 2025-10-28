export type RoomView = 'River view' | 'Standard view' | 'Cottage';
export type BedType = 'Double bed' | 'Twin bed';
export type BookingStatus = 'Paid' | 'Deposit' | 'Unpaid';
export type Language = 'en' | 'th';

export interface Room {
  number: string;
  floor: number;
  view: RoomView;
  bedType: BedType;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  rooms: string[];
  status: BookingStatus;
  depositAmount?: number;
  totalPrice?: number;
  email?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
}

export interface CleaningStatus {
  roomNumber: string;
  status: 'Clean' | 'Needs Cleaning';
}

export type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

export interface PageProps {
  setActivePage: (page: string) => void;
}
