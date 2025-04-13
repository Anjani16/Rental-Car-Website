import React, { useEffect, useState } from 'react';
import { getUserIdFromToken, getBookingsByRenter } from '../api';
import { useNavigate } from 'react-router-dom';
import '../styles/Catalog.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

const RentalHistory = () => {
  const [rentalHistory, setRentalHistory] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const rentals = await getBookingsByRenter(userId);
        setRentalHistory(rentals);
      } catch (error) {
        console.error('Error fetching rental history:', error);
        setError("Failed to load rental history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleLearnMore = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  if (isLoading) return <div className="loading-message">Loading rental history...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="catalog">
      <div className="catalog-header">
        <h2>Your Rental History</h2>
      </div>

      <div className="car-grid">
        {rentalHistory.length === 0 ? (
          <div className="no-cars-message">
            You haven't booked any cars yet. Start exploring now!
          </div>
        ) : (
          rentalHistory.map((bookedCar, index) => (
            // console.log(car);
            // console.log('Car details:', car),
            <div key={`${bookedCar.car._id}-${index}`} className="car-tile">
              <div className="car-image-container">
                <img
                  src={`${API_BASE_URL}/${bookedCar.car.image?.replace(/^\//, '')}`}
                  alt={`${bookedCar.car.brand} ${bookedCar.car.model}`}
                  className="car-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${API_BASE_URL}/uploads/default-car-image.jpg`;
                  }}
                />
              </div>

              <div className="car-details">
                <h3>{bookedCar.car.brand} {bookedCar.car.model}, {bookedCar.car.year}</h3>
                {/* <p className="car-price">${bookedCar.car.price}/hr</p> */}
                <p className="car-price">
                    <strong>Total Price:</strong> ${bookedCar.totalPrice || "Unknown"}
                  </p>
                <p className="car-status">
                    <strong>Booking Status:</strong> {bookedCar.status || "Unknown"}
                  </p>
              </div>

              <div className="car-buttons">
                <button
                  className="learn-more-button"
                  onClick={() => handleLearnMore(bookedCar)}
                >
                  More Info
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && selectedCar && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={handleCloseModal}>×</button>
            <div className="modal-car-image-container">
              <img
                src={`${API_BASE_URL}/${selectedCar.car.image?.replace(/^\//, '')}`}
                alt={`${selectedCar.car.brand} ${selectedCar.car.model}`}
                className="modal-car-image"
              />
            </div>
            <h2>{selectedCar.car.brand} {selectedCar.car.model}</h2>
            {/* <p>Type: {selectedCar.car.type}</p> */}
            {/* <p>Mileage: {selectedCar.car.mileage}</p> */}
            <p>Price: ${selectedCar.car.price}/hr</p>
            <p>Total Price: ${selectedCar.totalPrice}/hr</p>
            <p className="car-status">
              <strong>Booking Status:</strong> {selectedCar.status || "Unknown"}
            </p>
            {/* <p>Availability: {selectedCar.availability}</p> */}
            <div className="owner-details">
              <h3>Owner Details</h3>
              <p>Email: {selectedCar.owner?.email || "N/A"}</p>
              {/* <p>Phone: {selectedCar.owner?.phoneNumber || "N/A"}</p> */}
            </div>
            <div className="modal-buttons">
              {selectedCar.status === "pending" && (
                // <button
                //   className="book-now-button"
                //   onClick={() => navigate(`/booking/${selectedCar._id}`)}
                // >
                //   Book Again
                // </button>
                <button 
                className="book-now-button"
                onClick={() => navigate(`/renter/booking/${selectedCar._id}`)}
                >
                  Book Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalHistory;


// import React, { useEffect, useState } from 'react';
// import { getBookingsByRenter } from '../api';

// const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";
// const RenterHistory = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const data = await getBookingsByRenter();
//         setBookings(data);
//       } catch (error) {
//         console.error('Failed to fetch renter history', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   if (loading) return <div className="text-center py-10">Loading your booking history...</div>;
//   if (bookings.length === 0) return <div className="text-center py-10">No bookings found.</div>;

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Your Booking History</h2>

//       <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2">
//         {bookings.map((booking) => (
//           <div
//             key={booking._id}
//             className="flex items-center bg-white shadow-md rounded-xl p-4 border gap-4"
//           >
//             {/* Image container */}
//             <div className="w-32 h-24 rounded overflow-hidden flex-shrink-0 border">
//               <img
//                   src={`${API_BASE_URL}/${booking.car.image?.replace(/^\//, '')}`}
//                   alt={`${booking.car.brand} ${booking.car.model}`}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src = `${API_BASE_URL}/uploads/default-car-image.jpg`;
//                   }}
//               />
//               {/* <img
//                 src={booking.car?.image || 'https://via.placeholder.com/100'}
//                 alt={`${booking.car?.brand} ${booking.car?.model}`}
//                 className="w-full h-full object-cover"
//               /> */}
//             </div>

//             {/* Booking Info */}
//             <div className="flex flex-col text-gray-800">
//               <h3 className="text-lg font-bold">{booking.car?.brand} {booking.car?.model}</h3>
//               <p><strong>From:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
//               <p><strong>To:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
//               <p><strong>Status:</strong> <span className="capitalize">{booking.status}</span></p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RenterHistory;


// import React, { useEffect, useState } from 'react';
// import { getBookingsByRenter } from '../api';

// const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

// const RenterHistory = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const data = await getBookingsByRenter();
//         setBookings(data);
//       } catch (error) {
//         console.error('Failed to fetch renter history', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   if (loading) return <div className="text-center mt-20 text-gray-500 text-lg">Loading your booking history...</div>;
//   if (bookings.length === 0) return <div className="text-center mt-20 text-gray-500 text-lg">No bookings found.</div>;

//   return (
//     <div className="min-h-screen pt-24 px-6 bg-gray-100">
//       <div className="max-w-6xl mx-auto">
//         {/* Page Header */}
//         <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Booking History</h1>

//         <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4">
//           <table className="min-w-full table-auto border-collapse">
//             <thead>
//               <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
//                 <th className="px-4 py-3">Car</th>
//                 <th className="px-4 py-3">Brand & Model</th>
//                 <th className="px-4 py-3">Booking Dates</th>
//                 <th className="px-4 py-3">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {bookings.map((booking) => (
//                 <tr key={booking._id} className="border-b hover:bg-gray-50">
//                   {/* Car Image */}
//                   <td className="px-4 py-3">
//                   <div className="w-28 h-20 rounded overflow-hidden border border-gray-200 shadow-sm">
//                 <img
//                   src={`${API_BASE_URL}/${booking.car.image?.replace(/^\//, '')}`}
//                   alt={`${booking.car.brand} ${booking.car.model}`}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src = `${API_BASE_URL}/uploads/default-car-image.jpg`;
//                   }}
//                 />
//               </div>
//                     {/* <img
//                       src={booking.car?.image || 'https://via.placeholder.com/100'}
//                       alt="Car"
//                       className="h-16 w-24 object-cover rounded"
//                     /> */}
//                   </td>

//                   {/* Brand & Model */}
//                   <td className="px-4 py-3 text-gray-800 font-medium">
//                     {booking.car?.brand} {booking.car?.model}
//                   </td>

//                   {/* Booking Dates */}
//                   <td className="px-4 py-3 text-gray-600">
//                     From: {new Date(booking.startDate).toLocaleDateString()} <br />
//                     To: {new Date(booking.endDate).toLocaleDateString()}
//                   </td>

//                   {/* Status */}
//                   <td className="px-4 py-3">
//                     <span
//                       className={`px-3 py-1 text-sm font-medium rounded-full capitalize
//                         ${
//                           booking.status === 'approved'
//                             ? 'bg-green-100 text-green-700'
//                             : booking.status === 'rejected'
//                             ? 'bg-red-100 text-red-700'
//                             : 'bg-yellow-100 text-yellow-700'
//                         }`}
//                     >
//                       {booking.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RenterHistory;

// import React, { useEffect, useState } from 'react';
// import { getBookingsByRenter } from '../api';

// const RenterHistory = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const data = await getBookingsByRenter();
//         setBookings(data);
//       } catch (error) {
//         console.error('Failed to fetch renter history', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   if (loading) return <div className="text-center mt-10 text-gray-500 text-lg">Loading your booking history...</div>;
//   if (bookings.length === 0) return <div className="text-center mt-10 text-gray-500 text-lg">No bookings found.</div>;

//   return (
//     <div className="max-w-4xl mx-auto mt-10 px-4">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">🧾 Your Booking History</h2>
//       <div className="space-y-4">
//         {bookings.map((booking) => (
//           <div
//             key={booking._id}
//             className="bg-white p-6 rounded-2xl shadow hover:shadow-lg border transition-all duration-300"
//           >
//             <div className="flex flex-col md:flex-row justify-between md:items-center">
//               <div>
//                 <h3 className="text-xl font-semibold text-gray-800">
//                   {booking.car?.brand} {booking.car?.model}
//                 </h3>
//                 <p className="text-sm text-gray-500">
//                   📅 From: {new Date(booking.startDate).toLocaleDateString()} → To: {new Date(booking.endDate).toLocaleDateString()}
//                 </p>
//               </div>
//               <div className="mt-2 md:mt-0">
//                 <span
//                   className={`px-3 py-1 text-sm font-medium rounded-full capitalize
//                     ${booking.status === 'approved'
//                       ? 'bg-green-100 text-green-700'
//                       : booking.status === 'rejected'
//                       ? 'bg-red-100 text-red-700'
//                       : 'bg-yellow-100 text-yellow-700'}`}
//                 >
//                   {booking.status}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RenterHistory;



// import React, { useEffect, useState } from 'react';
// import { getBookingsByRenter } from '../api';

// const RenterHistory = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const data = await getBookingsByRenter();
//         setBookings(data);
//       } catch (error) {
//         console.error('Failed to fetch renter history', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   if (loading) return <div>Loading your booking history...</div>;

//   if (bookings.length === 0) return <div>No bookings found.</div>;

//   return (
//     <div>
//       <h2>Your Booking History</h2>
//       <ul>
//         {bookings.map((booking) => (
//           <li key={booking._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
//             <strong>{booking.car.brand} {booking.car.model}</strong><br />
//             From: {new Date(booking.startDate).toLocaleDateString()} To: {new Date(booking.endDate).toLocaleDateString()}<br />
//             Status: <strong>{booking.status}</strong>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default RenterHistory;