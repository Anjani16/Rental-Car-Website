import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Requests.css'; // Optional: external CSS

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5555';

const Requests = () => {
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

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      fetchRequests(); // refresh
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className="loading-message">Loading booking requests...</div>;

  return (
    <div className="requests-container" style={{ paddingTop: '80px' }}>
      <h2 className="requests-heading">Booking Requests</h2>
      {requests.length === 0 ? (
        <p>No booking requests found</p>
      ) : (
        <div className="table-wrapper">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Renter</th>
                <th>Start</th>
                <th>End</th>
                <th>Total ($)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>{req.car?.brand} {req.car?.model}</td>
                  <td>{req.renter?.firstName || 'Unknown'}</td>
                  <td>{req.startDate} {req.startTime}</td>
                  <td>{req.endDate} {req.endTime}</td>
                  <td>{req.totalPrice}</td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === 'pending' ? (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleStatusChange(req._id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleStatusChange(req._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Requests;
