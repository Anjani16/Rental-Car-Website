// frontend/components/Notifications.js
import React, { useEffect, useState } from 'react';
import { fetchNotifications } from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        <ul className="notification-list">
          {notifications.map(notification => (
            <li key={notification._id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
              <p>{notification.message}</p>
              <small>{new Date(notification.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;