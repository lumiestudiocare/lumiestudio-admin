import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';
import type { Booking, BookingStatus, Service, Professional, Notification, ChatMessage } from '../models';

// ── AUTH STORE ────────────────────────────────────────────────────
interface AuthStore {
  user: { email: string; id: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user;
    set({ user: u ? { id: u.id, email: u.email ?? '' } : null, loading: false });
    supabase.auth.onAuthStateChange((_e, session) => {
      const u2 = session?.user;
      set({ user: u2 ? { id: u2.id, email: u2.email ?? '' } : null });
    });
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

// ── BOOKING STORE ─────────────────────────────────────────────────
interface BookingStore {
  bookings: Booking[];
  loading: boolean;
  fetch: () => Promise<void>;
  updateStatus: (id: string, status: BookingStatus) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useBookingStore = create<BookingStore>()((set, get) => ({
  bookings: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(*), professional:professionals(*)')
      .order('created_at', { ascending: false });
    set({ bookings: (data as Booking[]) ?? [], loading: false });
  },

  updateStatus: async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    set(s => ({ bookings: s.bookings.map(b => b.id === id ? { ...b, status } : b) }));
  },

  deleteBooking: async (id) => {
    await supabase.from('bookings').delete().eq('id', id);
    set(s => ({ bookings: s.bookings.filter(b => b.id !== id) }));
  },

  subscribeRealtime: () => {
    const channel = supabase
      .channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' },
        () => get().fetch()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
}));

// ── PROFESSIONAL STORE ────────────────────────────────────────────
interface ProfessionalStore {
  professionals: Professional[];
  loading: boolean;
  fetch: () => Promise<void>;
  save: (p: Partial<Professional> & { id?: string }) => Promise<void>;
  toggle: (id: string, active: boolean) => Promise<void>;
}

export const useProfessionalStore = create<ProfessionalStore>()((set) => ({
  professionals: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const { data: profs } = await supabase.from('professionals').select('*').order('name');
    const { data: ps }    = await supabase.from('professional_services').select('*');
    const professionals   = (profs ?? []).map((p: Professional) => ({
      ...p,
      services: (ps ?? []).filter((x: { professional_id: string; service_id: string }) => x.professional_id === p.id).map((x: { professional_id: string; service_id: string }) => x.service_id as import('../models').ServiceId),
    }));
    set({ professionals, loading: false });
  },

  save: async (p) => {
    const { services, ...prof } = p;
    if (prof.id) {
      await supabase.from('professionals').update(prof).eq('id', prof.id);
    } else {
      const { data } = await supabase.from('professionals').insert(prof).select().single();
      prof.id = (data as Professional).id;
    }
    if (services && prof.id) {
      await supabase.from('professional_services').delete().eq('professional_id', prof.id);
      if (services.length > 0) {
        await supabase.from('professional_services').insert(
          services.map(s => ({ professional_id: prof.id, service_id: s }))
        );
      }
    }
    useProfessionalStore.getState().fetch();
  },

  toggle: async (id, active) => {
    await supabase.from('professionals').update({ active }).eq('id', id);
    useProfessionalStore.getState().fetch();
  },
}));

// ── SERVICE STORE ─────────────────────────────────────────────────
interface ServiceStore {
  services: Service[];
  loading: boolean;
  fetch: () => Promise<void>;
  save: (s: Partial<Service>) => Promise<void>;
  toggle: (id: string, active: boolean) => Promise<void>;
}

export const useServiceStore = create<ServiceStore>()((set) => ({
  services: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const { data } = await supabase.from('services').select('*').order('name');
    set({ services: (data as Service[]) ?? [], loading: false });
  },

  save: async (s) => {
    if (s.id) await supabase.from('services').update(s).eq('id', s.id);
    else       await supabase.from('services').insert(s);
    useServiceStore.getState().fetch();
  },

  toggle: async (id, active) => {
    await supabase.from('services').update({ active }).eq('id', id);
    useServiceStore.getState().fetch();
  },
}));

// ── NOTIFICATION STORE ────────────────────────────────────────────
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      fetch: async () => {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        const notifs = (data as Notification[]) ?? [];
        set({ notifications: notifs, unreadCount: notifs.filter(n => !n.read).length });
      },

      markRead: async (id) => {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
        set(s => {
          const notifications = s.notifications.map(n => n.id === id ? { ...n, read: true } : n);
          return { notifications, unreadCount: notifications.filter(n => !n.read).length };
        });
      },

      markAllRead: async () => {
        await supabase.from('notifications').update({ read: true }).eq('read', false);
        set(s => ({
          notifications: s.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      subscribeRealtime: () => {
        const channel = supabase
          .channel('notifications-realtime')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
            (payload) => {
              const n = payload.new as Notification;
              set(s => ({
                notifications: [n, ...s.notifications],
                unreadCount: s.unreadCount + 1,
              }));
            }
          )
          .subscribe();
        return () => { supabase.removeChannel(channel); };
      },
    }),
    { name: 'lumie-admin-notifications', partialize: (s) => ({ notifications: s.notifications }) }
  )
);

// ── CHAT STORE ────────────────────────────────────────────────────
interface ChatStore {
  messages: Record<string, ChatMessage[]>; // bookingId → messages
  loading: boolean;
  fetchMessages: (bookingId: string) => Promise<void>;
  sendMessage: (bookingId: string, message: string, senderName: string) => Promise<void>;
  subscribeRealtime: (bookingId: string) => () => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
  messages: {},
  loading: false,

  fetchMessages: async (bookingId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at');
    set(s => ({ messages: { ...s.messages, [bookingId]: (data as ChatMessage[]) ?? [] }, loading: false }));
  },

  sendMessage: async (bookingId, message, senderName) => {
    const msg = { booking_id: bookingId, sender: senderName, sender_role: 'admin' as const, message, read: false };
    const { data } = await supabase.from('chat_messages').insert(msg).select().single();
    if (data) {
      set(s => ({
        messages: {
          ...s.messages,
          [bookingId]: [...(s.messages[bookingId] ?? []), data as ChatMessage],
        },
      }));
    }
  },

  subscribeRealtime: (bookingId) => {
    const channel = supabase
      .channel(`chat-${bookingId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          const msg = payload.new as ChatMessage;
          set(s => ({
            messages: {
              ...s.messages,
              [bookingId]: [...(s.messages[bookingId] ?? []), msg],
            },
          }));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
}));

// ── CLIENT STORE ──────────────────────────────────────────────────
interface ClientStore {
  clients: import('../models').Client[];
  loading: boolean;
  fetch: () => Promise<void>;
  save: (c: Partial<import('../models').Client>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientStore>()((set) => ({
  clients: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    set({ clients: (data as import('../models').Client[]) ?? [], loading: false });
  },

  save: async (c) => {
    if (c.id) {
      await supabase.from('clients').update(c).eq('id', c.id);
    } else {
      await supabase.from('clients').insert(c);
    }
    useClientStore.getState().fetch();
  },

  remove: async (id) => {
    await supabase.from('clients').delete().eq('id', id);
    set(s => ({ clients: s.clients.filter(c => c.id !== id) }));
  },
}));
