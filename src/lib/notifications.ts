import { supabase } from '@/integrations/supabase/client';

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  return supabase.rpc('create_notification', {
    p_user_id: params.userId,
    p_title: params.title,
    p_message: params.message,
    p_type: params.type,
    p_link: params.link ?? null,
  });
}

export async function broadcastNotification(params: {
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  return supabase.rpc('broadcast_notification', {
    p_title: params.title,
    p_message: params.message,
    p_type: params.type,
    p_link: params.link ?? null,
  });
}

export async function sendWelcomeNotification(userId: string) {
  return supabase.rpc('send_welcome_notification', { p_user_id: userId });
}

const ORDER_STATUS_NOTIFS: Record<string, { title: string; message: string; type: string }> = {
  processing: {
    title: 'Encomenda em preparação',
    message: 'A sua encomenda está a ser preparada pela nossa equipa.',
    type: 'order_processing',
  },
  shipped: {
    title: '🚚 Encomenda a caminho!',
    message: 'A sua encomenda foi enviada e está em transporte. Acompanhe na área de pedidos.',
    type: 'order_shipped',
  },
  completed: {
    title: '✅ Encomenda entregue',
    message: 'A sua encomenda foi entregue com sucesso. Obrigado por comprar na Sinkera!',
    type: 'order_completed',
  },
  cancelled: {
    title: 'Pedido cancelado',
    message: 'O seu pedido foi cancelado. Contacte o suporte para mais informações.',
    type: 'order_cancelled',
  },
};

export async function notifyOrderStatus(userId: string, status: string) {
  const notif = ORDER_STATUS_NOTIFS[status];
  if (!notif) return;
  return createNotification({
    userId,
    title: notif.title,
    message: notif.message,
    type: notif.type,
    link: '/pedidos',
  });
}
