'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Notification } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    api.notifications.list().then((d) => setNotifications(d as Notification[])).catch(() => {});
  }, []);

  const markAllRead = async () => {
    await api.notifications.markAllRead();
    setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <button onClick={markAllRead} className="text-sm text-primary hover:underline">Mark all read</button>
        </div>

        {notifications.length === 0 ? (
          <div className="card py-16 text-center">
            <Bell className="mx-auto mb-4 h-10 w-10 text-gray-300" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`card ${!n.isRead ? 'border-l-4 border-l-primary' : ''}`}>
                <div className="flex justify-between">
                  <h3 className="font-semibold">{n.title}</h3>
                  <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
