import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Notifications.css'; // reuse or create new if needed

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5555';

const RenterNotifications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/bookings/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter only approved or rejected requests
      const filtered = res.data.filter(
        (req) => req.status === 'approved' || req.status === 'rejected'
      );

      setRequests(filtered);
    } catch (error) {
      toast.error('Failed to fetch booking notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className="loading-message">Loading booking notifications...</div>;

  return (
    <div className="requests-container" style={{ paddingTop: '80px' }}>
      <h2 className="requests-heading">Notifications</h2>
      {requests.length === 0 ? (
        <p style={{ color: 'red' }}>No Notifications yet</p>
      ) : (
        <div className="notifications-scroll-wrapper">
          <div className="notification-list">
            {requests.map((req) => (
              <div key={req._id} className={`notification-card ${req.status}`}>
                <div>
                  {req.status === 'approved' ? (
                    <span>✅ Owner <strong>approved</strong> your request for <strong>{req.car?.brand} {req.car?.model}</strong>.</span>
                  ) : (
                    <span>❌ Owner <strong>rejected</strong> your request for <strong>{req.car?.brand} {req.car?.model}</strong>.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RenterNotifications;
