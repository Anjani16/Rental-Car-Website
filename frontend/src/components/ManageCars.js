import React, { useState, useEffect , useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ManageCars.css";
import { fetchUserCars } from '../api'; // Import the fetchUserCars function
import { ThemeContext } from './ThemeContext'; // Import your theme context

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";
const ManageCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext); 
  // Fetch cars owned by the logged-in user
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetchUserCars(); // Use the fetchUserCars function from api.js
        setCars(response.data); // Set the cars state with the fetched data
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching cars:', error);
        setError('Failed to fetch cars. Please try again.');
      }
    };

    fetchCars();
  }, []);

  // Handle delete car
  const handleDeleteCar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cars/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete car');
      }

      // Remove the deleted car from the state
      setCars(cars.filter((car) => car._id !== id));
      alert('Car deleted successfully!');
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Failed to delete car. Please try again.');
    }
  };

  // Handle update car
  const handleUpdateCar = (id) => {
    const carToUpdate = cars.find((car) => car._id === id);
    navigate("/update-car", { state: { car: carToUpdate } }); // Navigate to UpdateCar component
  };

  return (
    <div className={`manage-cars ${theme}`}>
      <h2 className={`heading ${theme}`}>Manage Cars</h2>
      <button
        className={`addcar ${theme}`}
        onClick={() => navigate("/add-car")}
        style={{
          border: "1px solid #575757",
          borderRadius: "0",
          padding: "10px 20px",
          backgroundColor: "#E7E7E7",
          color: "black",
        }}
      >
        + Add New Car
      </button>
      <h3 className={`owned-cars-header ${theme}`}>Owned Cars</h3>
      {error && <p className={`error-message ${theme}`}>{error}</p>}
      <div className={`table-container ${theme}`}>
      <table className={`car-table ${theme}`}>
  <tbody>
    {cars.map((car) => (
      <tr key={car._id} className={`car-row ${theme}`}>
        {/* Image Column */}
        <td>
          {car.image ? (
            <img 
      src={`${API_BASE_URL.replace(/\/$/, '')}/${car.image.replace(/^\//, '')}`} 
      alt={`${car.brand} ${car.model}`} 
      className={`car-imageOwner ${theme}`}
    />
          ) : (
            <div className={`no-image ${theme}`}>No Image</div>
          )}
        </td>

        {/* Details Column */}
        <td className="details-column">
          <div className="detail-row">
            <span className="detail-label"></span> {car.brand} {car.model}
          </div>
          <div className="detail-row">
            <span className="detail-label"></span> {car.type}
          </div>
          <div className="detail-row">
            <span className="detail-label"></span> {car.year} Model
          </div>
        </td>

        {/* Price Column */}
        <td>${car.price}</td>

        {/* Availability Column */}
        <td className={`availability ${car.availability.toLowerCase() === 'available' ? 'available' : 'unavailable'}`}>
  {car.availability}
</td>


        {/* Actions Column */}
        <td className="actions-column">
          <div className="buttons-container">
            <button onClick={() => handleUpdateCar(car._id)}>Update</button>
            <button onClick={() => handleDeleteCar(car._id)}>Delete</button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
      </div>
    </div>
  );
};

export default ManageCars;
