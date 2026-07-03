import { useState, useEffect, useCallback } from "react";
import * as notificationService from "@/services/notificationService";

export function useNotifications(isAuthenticated) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationService.getNotifications().then(setNotifications);
  }, [isAuthenticated]);

  const addNotification = useCallback(async (data) => {
    const notification = await notificationService.addNotification(data);
    setNotifications((prev) => [notification, ...prev]);
    return notification;
  }, []);

  const toggleRead = useCallback(async (id) => {
    const updated = await notificationService.toggleRead(id);
    setNotifications(updated);
  }, []);

  const markAllRead = useCallback(async () => {
    const updated = await notificationService.markAllRead();
    setNotifications(updated);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, addNotification, toggleRead, markAllRead };
}
