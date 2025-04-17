import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Requests.css'; // reuse or create new if needed

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5555';

const Notifications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/bookings/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (error) {
      toast.error('Failed to fetch booking requests');
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
        <div className="notification-list">
  {requests.map((req) => (
    <div key={req._id} className="notification-card">
      <div>
        <strong>{req.renter?.firstName || 'Someone'}</strong> has requested to book <strong>{req.car?.brand} {req.car?.model}</strong>.
      </div>
      <div>
        From <strong>{req.startDate} {req.startTime}</strong> to <strong>{req.endDate} {req.endTime}</strong>.
      </div>
      <div className="notification-divider"></div>
      <div style={{ fontSize: '14px', color: '#555' }}>Total: ${req.totalPrice}</div>
    </div>
  ))}
</div>

      )}
    </div>
  );
};

export default Notifications;
