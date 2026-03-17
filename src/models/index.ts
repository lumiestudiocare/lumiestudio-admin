export type ServiceId = 'skincare' | 'manicure' | 'sobrancelhas' | 'spa' | 'consultoria';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Service {
  id: ServiceId;
  name: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
  category: string;
  active: boolean;
  created_at?: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  available_days: number[];
  active: boolean;
  services?: ServiceId[];
  created_at?: string;
}

export interface Booking {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  service_id: ServiceId;
  professional_id: string;
  date: string;
  time: string;
  notes: string;
  status: BookingStatus;
  payment_method?: string;
  payment_id?: string;
  payment_amount?: number;
  paid_at?: string;
  created_at: string;
  updated_at?: string;
  service?: Service;
  professional?: Professional;
}

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender: string;
  sender_role: 'client' | 'admin';
  message: string;
  read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'new_booking' | 'payment_confirmed' | 'cancellation' | 'message';
  title: string;
  body: string;
  booking_id?: string;
  read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedToday: number;
  completedMonth: number;
  revenueMonth: number;
  revenueTotal: number;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  birthdate?: string;
  notes?: string;
  manutencao: number;
  created_at: string;
  updated_at?: string;
  // computed
  bookings?: Booking[];
  total_spent?: number;
  last_visit?: string;
}
