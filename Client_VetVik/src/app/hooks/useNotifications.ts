import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '../../api/endpoints';
import type { InboxNotificationResponse } from '../../api/types';
import { useAuth } from '../auth/AuthContext';

const POLL_INTERVAL_MS = 60_000;

export function categoryTone(category: string): string {
  if (category === 'Appointment') return 'bg-teal-500';
  if (category === 'MedicalRecord') return 'bg-sky-500';
  return 'bg-slate-400';
}

export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<InboxNotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setUnreadCount(0);
      return;
    }

    try {
      const inbox = await notificationsApi.inbox();
      setItems(inbox.items);
      setUnreadCount(inbox.unreadCount);
    } catch {
      // Ignore transient errors and keep previous state.
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return undefined;

    const intervalId = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh, user]);

  const markRead = useCallback(async (id: string) => {
    await notificationsApi.markRead(id);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }, []);

  return {
    items,
    unreadCount,
    refresh,
    markRead,
    markAllRead,
  };
}
