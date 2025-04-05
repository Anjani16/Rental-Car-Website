import React, { useEffect, useState } from 'react';
import { fetchNotifications } from '../api';
import { FaBell, FaCheck } from 'react-icons/fa';
import '../styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      // You would need to implement markAsRead in your API
      // await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (loading) {
    return <div className="loading-notifications">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error-notifications">{error}</div>;
  }

  return (
    <div className="notifications-container">
      <h2><FaBell /> Notifications</h2>
      
      {notifications.length === 0 ? (
        <p className="no-notifications">No notifications yet</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map(notification => (
            <li 
              key={notification._id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
              {!notification.read && (
                <button 
                  className="mark-read-button"
                  onClick={() => handleMarkAsRead(notification._id)}
                  title="Mark as read"
                >
                  <FaCheck />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;