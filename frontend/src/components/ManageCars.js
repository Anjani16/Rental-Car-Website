import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ManageCars.css";
import { fetchUserCars } from '../api'; // Import the fetchUserCars function

const ManageCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [error, setError] = useState(null);

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
      const response = await fetch(`https://rental-car-website-5iwe.onrender.com/api/cars/${id}`, {
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
    <div className="manage-cars">
      <h2>Manage Cars</h2>
      <button
        className="addcar"
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
      <h3>Owned Cars</h3>
      {error && <p className="error-message">{error}</p>}
      <div className="table-container">
      <table className="car-table">
  <tbody>
    {cars.map((car) => (
      <tr key={car._id} className="car-row">
        {/* Image Column */}
        <td>
          {car.image ? (
            <img src={car.image} alt={`${car.brand} ${car.model}`} className="car-imageOwner" />
          ) : (
            <div className="no-image">No Image</div>
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
        <td>{car.availability}</td>

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