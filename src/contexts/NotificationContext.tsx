import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type MockNotificationKind = 'order' | 'waitlist' | 'support' | 'gift' | 'general';

export interface MockNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  kind: MockNotificationKind;
  /** Optional in-app path for "View" actions */
  href?: string;
}

const STORAGE_KEY = 'myticket_mock_notifications';

function load(): MockNotification[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MockNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: MockNotification[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

type NotificationContextValue = {
  items: MockNotification[];
  unreadCount: number;
  pushNotification: (n: Omit<MockNotification, 'id' | 'read' | 'createdAt'> & { id?: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MockNotification[]>(() => load());

  const pushNotification = useCallback((n: Omit<MockNotification, 'id' | 'read' | 'createdAt'> & { id?: string }) => {
    const id = n.id ?? `n_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const entry: MockNotification = {
      ...n,
      id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => {
      const next = [entry, ...prev];
      save(next);
      return next;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, read: true } : x));
      save(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => {
      const next = prev.map((x) => ({ ...x, read: true }));
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    save([]);
    setItems([]);
  }, []);

  const unreadCount = useMemo(() => items.filter((x) => !x.read).length, [items]);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      pushNotification,
      markRead,
      markAllRead,
      clearAll,
    }),
    [items, unreadCount, pushNotification, markRead, markAllRead, clearAll]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
