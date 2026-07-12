import type { Service, Professional } from '../models';

// Semente inicial exibida antes do primeiro carregamento do Supabase
// (e como fallback caso o Supabase esteja indisponível). A fonte da
// verdade em produção é a tabela `services`, incluindo o campo `active`
// controlado pelo painel admin — ver useCatalogStore em ../store.
export const SERVICES: Service[] = [
  {
    id: 'skincare',
    name: 'Skincare & Facial',
    description: 'Limpeza profunda, hidratação, peeling e tratamentos anti-aging com produtos de alta performance.',
    duration: 60,
    price: 180,
    icon: '✦',
    category: 'Rosto',
    active: true,
  },
  {
    id: 'manicure',
    name: 'Manicure & Nail Art',
    description: 'Manicure, pedicure, esmaltação em gel e nail art exclusiva para quem busca requinte nos detalhes.',
    duration: 75,
    price: 120,
    icon: '💅',
    category: 'Unhas',
    active: true,
  },
  {
    id: 'sobrancelhas',
    name: 'Design de Sobrancelhas',
    description: 'Henna, micropigmentação e brow lamination para o olhar perfeito que emoldura toda a sua beleza.',
    duration: 45,
    price: 90,
    icon: '🌸',
    category: 'Olhar',
    active: true,
  },
  {
    id: 'spa',
    name: 'Spa & Relaxamento',
    description: 'Massagens faciais, rituais de aromaterapia e tratamentos express para renovar sua energia.',
    duration: 90,
    price: 220,
    icon: '🕯️',
    category: 'Corpo',
    active: true,
  },
  {
    id: 'consultoria',
    name: 'Consultoria de Beleza',
    description: 'Análise de coloração pessoal, rotina de skincare e orientação de estilo para o seu biotipo.',
    duration: 60,
    price: 150,
    icon: '💛',
    category: 'Estilo',
    active: true,
  },
];

export const PROFESSIONALS: Professional[] = [
  {
    id: 'prof-1',
    name: 'Simone Mariano',
    role: 'Skincare, Spa & Consultoria',
    avatar: 'SM',
    services: ['skincare', 'spa', 'consultoria'],
    availableDays: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'prof-2',
    name: 'Rafaela Oliveira',
    role: 'Design de Sobrancelhas',
    avatar: 'RO',
    services: ['sobrancelhas'],
    availableDays: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'prof-3',
    name: 'Dani Martins',
    role: 'Manicure & Nail Art',
    avatar: 'DM',
    services: ['manicure'],
    availableDays: [1, 2, 3, 4, 5, 6],
  },
];

export const TIME_SLOTS = [
  '09:00', '09:45', '10:30', '11:15',
  '13:00', '13:45', '14:30', '15:15',
  '16:00', '16:45', '17:30', '18:15',
];

export const ADMIN_CREDENTIALS = {
  username: 'admin@lumie.com.br',
  password: 'lumie2025',
};
