import React, { useState, useEffect } from "react";
import { fetchAllCars, toggleWishlist, getUserIdFromToken } from "../api";
import { FaHeart, FaRegHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import { useLocation } from "react-router-dom"; // Import useLocation
import "../styles/Catalog.css";
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

const Catalog = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation(); // Get the current location
  const userId = getUserIdFromToken();

  // Fetch all cars from the database
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const carsData = await fetchAllCars();
        setCars(carsData);
        setFilteredCars(carsData); // Reset filteredCars to all cars
      } catch (error) {
        console.error("Error fetching cars:", error);
      }
    };
    fetchCars();
  }, []);

  // Reset filteredCars whenever the location changes (i.e., when navigating back to the Catalog page)
  useEffect(() => {
    setFilteredCars(cars); // Reset filteredCars to all cars
    setSearchQuery(""); // Clear the search query
  }, [location, cars]); // Trigger when location or cars state changes

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search (triggered by clicking the search icon or pressing Enter)
  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim(); // Trim whitespace and convert to lowercase

    // Filter cars based on the search query
    const filtered = cars.filter(
      (car) =>
        car.brand.toLowerCase().includes(query) || // Search by brand
        car.model.toLowerCase().includes(query) || // Search by model
        car.type.toLowerCase().includes(query) || // Search by type
        car.year.toString().includes(query) || // Search by year
        car.description.toLowerCase().includes(query) // Search by description
    );
    setFilteredCars(filtered);
  };

  // Handle "Enter" key press in the search bar
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle "Learn More" click
  const handleLearnMore = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  // Handle wishlist icon click
  const handleWishlistClick = async (carId) => {
    try {
      const updatedCar = await toggleWishlist(carId); // Toggle wishlist
      // Update the cars state to reflect the new wishlist status
      setCars((prevCars) =>
        prevCars.map((car) =>
          car._id === updatedCar.car._id ? updatedCar.car : car
        )
      );
      setFilteredCars((prevCars) =>
        prevCars.map((car) =>
          car._id === updatedCar.car._id ? updatedCar.car : car
        )
      );
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  return (
    <div className="catalog">
      {/* Catalog Header and Search Bar */}
      <div className="catalog-header">
        <h2>Catalog</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search cars by brand, model, type, year, or description..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
          />
          <button className="search-icon-button" onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
        {filteredCars.length === 0 && searchQuery.trim() !== "" && (
          <div className="no-cars-message" style={{ color: "red" }}>
            Sorry, no cars match your search for "{searchQuery}".
          </div>
        )}
      </div>

      {/* Cars Grid */}
      <div className="car-grid">
        {filteredCars.map((car) => (
          <div key={car._id} className="car-tile">
            {/* Wishlist Icon */}

            <div className="wishlist-icon" onClick={() => handleWishlistClick(car._id)}>
            {car.wishlistedBy?.includes(userId) ? (
              <FaHeart style={{ color: "red" }} />
            ) : (
              <FaRegHeart style={{ color: "black" }} />
            )}
          </div>

            {/* Car Image */}
            <div className="car-image-container">
              <img src={`${API_BASE_URL.replace(/\/$/, '')}/${car.image.replace(/^\//, '')}`} 
     alt={`${car.brand} ${car.model}`} className="car-image" />
            </div>

            {/* Car Details */}
            <div className="car-details">
              <h3>{car.brand} {car.model}, {car.year}</h3>
              <p className="car-price">${car.price}/hr</p>
            </div>

            {/* Buttons */}
            <div className="car-buttons">
              <button className="cart-button">
                <FaShoppingCart />
              </button>
              <button
                className="learn-more-button"
                onClick={() => handleLearnMore(car)}
              >
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Detailed Car Information */}
      {isModalOpen && selectedCar && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={handleCloseModal}>
              ×
            </button>
            <div className="modal-car-image-container">
              <img src={`${API_BASE_URL.replace(/\/$/, '')}/${selectedCar.image.replace(/^\//, '')}`} 
     alt={`${selectedCar.brand} ${selectedCar.model}`} className="modal-car-image" />
            </div>
            <h2>{selectedCar.brand} {selectedCar.model}</h2>
            <p>Type: {selectedCar.type}</p>
            <p>Mileage: {selectedCar.mileage}</p>
            <p>Price: ${selectedCar.price}/hr</p>
            <p>Availability: {selectedCar.availability}</p>
            <div className="modal-buttons">
              <button className="cart-button2">
                <FaShoppingCart />
              </button>
              <button className="book-now-button">Book Now</button>
            </div>
            <div className="owner-details">
              <h3>Owner Details</h3>
              <p>Name: {selectedCar.owner?.firstName || "N/A"}</p>
              <p>Phone: {selectedCar.owner?.phoneNumber || "N/A"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
