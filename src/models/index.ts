// ── DOMAIN MODELS ────────────────────────────────────────────────

export type ServiceId =
  | 'skincare'
  | 'manicure'
  | 'sobrancelhas'
  | 'spa'
  | 'consultoria';

export interface Service {
  id: ServiceId;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  icon: string;
  category: string;
  active: boolean;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  avatar: string;
  services: ServiceId[];
  availableDays: number[]; // 0=Sun..6=Sat
}

export interface TimeSlot {
  time: string; // "HH:mm"
  available: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: ServiceId;
  professionalId: string;
  date: string; // ISO yyyy-MM-dd
  time: string; // HH:mm
  notes: string;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingFormData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: ServiceId | '';
  professionalId: string;
  date: string;
  time: string;
  notes: string;
}

export interface AdminUser {
  username: string;
  password: string; // hashed in real app
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedToday: number;
  completedThisMonth: number;
}
