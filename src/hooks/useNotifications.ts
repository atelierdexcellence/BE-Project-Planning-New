import { useState, useCallback, useEffect } from 'react';
import type { Notification } from '../types';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    user_id: '1',
    project_id: '3',
    type: 'overdue_start',
    message: 'Project Gamma start date is overdue',
    read: false,
    created_at: '2024-01-26T10:00:00Z'
  },
  {
    id: '2',
    user_id: '1',
    project_id: '2',
    type: 'upcoming_deadline',
    message: 'Project Beta wood/foam launch approaching in 2 days',
    read: false,
    created_at: '2024-01-26T09:00:00Z'
  }
];

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>(
    MOCK_NOTIFICATIONS.filter(n => n.user_id === userId)
  );

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for overdue projects and create notifications
      // This would be replaced with WebSocket or Server-Sent Events
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };
};
