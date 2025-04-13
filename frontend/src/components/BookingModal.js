import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { submitBooking } from '../api';

const BookingModal = ({ car, onClose }) => {
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [hours, setHours] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (startDateTime && endDateTime) {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      const diffInMs = end - start;

      if (diffInMs > 0) {
        const hrs = Math.ceil(diffInMs / (1000 * 60 * 60));
        setHours(hrs);
        setTotalPrice(hrs * car.price);
      } else {
        setHours(0);
        setTotalPrice(0);
      }
    }
  }, [startDateTime, endDateTime, car.price]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hours <= 0) {
      toast.error('End date/time must be after start date/time');
      return;
    }

    try {
      const response = await submitBooking({
        carId: car._id,
        startDate: startDateTime.split('T')[0],
        endDate: endDateTime.split('T')[0],
        startTime: startDateTime.split('T')[1],
        endTime: endDateTime.split('T')[1],
        hours,
        totalPrice,
      });

      toast.success(response.message);
      onClose();
      navigate('/renter/history');
    } catch (error) {
      toast.error('Booking failed. Try again.');
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-button" onClick={onClose}>×</button>
        <h2>Book {car.brand} {car.model}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="form-group">
            <label><FaCalendarAlt /> Start Date & Time</label>
            <input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="form-group">
            <label><FaCalendarAlt /> End Date & Time</label>
            <input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              min={startDateTime}
              required
            />
          </div>

          <div className="summary-card">
            <p><FaClock /> <strong>Duration:</strong> {hours} hour(s)</p>
            <p><FaMoneyBillWave /> <strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
          </div>

          <button type="submit" className="proceed-button">
            Proceed with Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

// // frontend/components/BookingModal.js
// import React, { useState } from 'react';
// import { FaCalendarAlt, FaClock } from 'react-icons/fa';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useNavigate } from 'react-router-dom';
// import { submitBooking } from '../api';

// const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

// const BookingModal = ({ car, onClose, onSubmit }) => {
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [startTime, setStartTime] = useState('');
//   const [endTime, setEndTime] = useState('');
//   const navigate = useNavigate();

//   const calculateHours = () => {
//     if (!startDate || !endDate || !startTime || !endTime) return 0;
    
//     const start = new Date(`${startDate}T${startTime}`);
//     const end = new Date(`${endDate}T${endTime}`);
//     const diffInMs = end - start;
//     return Math.ceil(diffInMs / (1000 * 60 * 60)); // Convert ms to hours
//   };

//   // const handleSubmit = (e) => {
//   //   e.preventDefault();
//   //   const hours = calculateHours();
    
//   //   if (hours <= 0) {
//   //     toast.error('Please select valid dates and times');
//   //     return;
//   //   }

//   //   onSubmit({
//   //     carId: car._id,
//   //     startDate,
//   //     endDate,
//   //     startTime,
//   //     endTime,
//   //     hours,
//   //     totalPrice: car.price * hours
//   //   });

//   //   toast.success('Booking request submitted successfully!');
//   //   onClose();
//   //   navigate('/renter/history');
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const hours = calculateHours();
  
//     if (hours <= 0) {
//       toast.error('Please select valid dates and times');
//       return;
//     }
  
//     const bookingData = {
//       carId: car._id,
//       startDate,
//       endDate,
//       startTime,
//       endTime,
//       hours,
//       totalPrice: car.price * hours,
//     };
  
//     try {
//       const response = await submitBooking(bookingData); // ✅ Call API
//       // toast.success('Booking request submitted successfully!');
//       toast.success(response.message); // ✅ Use message from backend

//       onClose();
//       navigate('/renter/history');
//     } catch (error) {
//       toast.error('Failed to submit booking. Please try again.');
//       console.error('Booking Error:', error);
//     }
//   };
  
  
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
//         <button className="close-modal-button" onClick={onClose}>
//           ×
//         </button>
        
//         <h2>Book {car.brand} {car.model}</h2>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>
//               <FaCalendarAlt /> Start Date
//             </label>
//             <input 
//               type="date" 
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               min={new Date().toISOString().split('T')[0]}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>
//               <FaClock /> Start Time
//             </label>
//             <input 
//               type="time" 
//               value={startTime}
//               onChange={(e) => setStartTime(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>
//               <FaCalendarAlt /> End Date
//             </label>
//             <input 
//               type="date" 
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               min={startDate || new Date().toISOString().split('T')[0]}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>
//               <FaClock /> End Time
//             </label>
//             <input 
//               type="time" 
//               value={endTime}
//               onChange={(e) => setEndTime(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="booking-summary">
//             <p><strong>Duration:</strong> {calculateHours()} hours</p>
//             <p><strong>Total Price:</strong> ${(car.price * calculateHours()).toFixed(2)}</p>
//           </div>
          
//           <button type="submit" className="proceed-button">
//             Proceed with Booking
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default BookingModal;