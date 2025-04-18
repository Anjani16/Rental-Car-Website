import React, { useEffect, useState, useContext  } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Requests.css'; // Reuse same styling
import { ThemeContext } from './ThemeContext';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5555';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/bookings/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nonPending = res.data.filter(
        (req) => req.status === 'approved' || req.status === 'rejected'
      );
      setHistory(nonPending);
    } catch (error) {
      toast.error('Failed to fetch booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <div className="loading-message">Loading booking history...</div>;

  return (
    <div className={`history-container ${theme}`} style={{marginTop:"10%"}}>
      <h2 className={`history-heading ${theme}`}>Booking History</h2>
      {history.length === 0 ? (
        <p className={`no-history-message ${theme}`}>No booking history found</p>
      ) : (
        <div className={`table-wrapper ${theme}`}>
          <table className={`history-table ${theme}`}>
            <thead>
              <tr>
                <th>Car</th>
                <th>Renter</th>
                <th>Start</th>
                <th>End</th>
                <th>Total ($)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((req) => (
                <tr key={req._id} className={`table-row ${theme}`}>
                  <td>{req.car?.brand} {req.car?.model}</td>
                  <td>{req.renter?.firstName || 'Unknown'}</td>
                  <td>{req.startDate} {req.startTime}</td>
                  <td>{req.endDate} {req.endTime}</td>
                  <td>{req.totalPrice}</td>
                  <td
                    className={
                      req.status === 'approved'
                        ? 'status-approved'
                        : req.status === 'rejected'
                        ? 'status-rejected'
                        : ''
                    }
                  >
                    {req.status}
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

export default History;
