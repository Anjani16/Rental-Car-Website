import React, { useState, useEffect } from "react";
import { 
  fetchAllCars, 
  toggleWishlist, 
  getUserIdFromToken,
  fetchCartItems,
  addToCart, 
  removeFromCart,
  submitBooking
} from "../api";
import { FaHeart, FaRegHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Catalog.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingModal from "./BookingModal";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

const Catalog = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = getUserIdFromToken();

  // Fetch all cars and cart items
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [carsData, cartData] = await Promise.all([
          fetchAllCars(),
          userId ? fetchCartItems().catch(() => []) : Promise.resolve([])
        ]);
        
        setCars(carsData);
        setFilteredCars(carsData);
        setCartItems(cartData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Reset filtered cars when location changes
  useEffect(() => {
    setFilteredCars(cars);
    setSearchQuery("");
  }, [location, cars]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredCars(cars);
      return;
    }

    const filtered = cars.filter(
      car =>
        car.brand?.toLowerCase().includes(query) ||
        car.model?.toLowerCase().includes(query) ||
        car.type?.toLowerCase().includes(query) ||
        car.year?.toString().includes(query) ||
        car.description?.toLowerCase().includes(query)
    );
    setFilteredCars(filtered);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCartClick = async (car) => {
    if (!userId) {
      alert("Please login to manage your cart");
      return;
    }
  
    setIsCartLoading(true); // Add loading state
    try {
      const isInCart = cartItems.some(item => item._id === car._id);
      
      if (isInCart) {
        await removeFromCart(car._id);
        setCartItems(prev => prev.filter(item => item._id !== car._id));
      } else {
        const response = await addToCart(car._id, 1); // Wait for response
        setCartItems(prev => [...prev, { ...car, hours: 1 }]);
        
        // Update cars state to reflect cart status
        setCars(prev => prev.map(c => 
          c._id === car._id ? { ...c, cartedBy: [...(c.cartedBy || []), { userId, hours: 1 }] } : c
        ));
        setFilteredCars(prev => prev.map(c => 
          c._id === car._id ? { ...c, cartedBy: [...(c.cartedBy || []), { userId, hours: 1 }] } : c
        ));
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error(`Failed to update cart: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleWishlistClick = async (carId) => {
    if (!userId) {
      alert("Please login to manage your wishlist");
      return;
    }

    try {
      const updatedCar = await toggleWishlist(carId);
      setCars(prev => 
        prev.map(car => car._id === updatedCar.car._id ? updatedCar.car : car)
      );
      setFilteredCars(prev => 
        prev.map(car => car._id === updatedCar.car._id ? updatedCar.car : car)
      );
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist.");
    }
  };

  const handleLearnMore = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      await submitBooking(bookingData);
      toast.success('Booking request submitted successfully!');
      setIsBookingModalOpen(false);
      navigate('/renter/history');
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking request');
    }
  };

  if (isLoading) {
    return <div className="loading-message">Loading cars...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="catalog">
      <ToastContainer position="top-right" autoClose={3000} />
      
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
          <div className="no-cars-message">
            No cars found matching "{searchQuery}"
          </div>
        )}
      </div>

      {filteredCars.length === 0 && searchQuery.trim() === "" ? (
        <div className="no-cars-message">No cars available in the catalog</div>
      ) : (
        <div className="car-grid">
          {filteredCars.map((car) => {
            const isWishlisted = car.wishlistedBy?.includes(userId);
            const isInCart = cartItems.some(item => item._id === car._id);

            return (
              <div key={car._id} className="car-tile">
                <div 
                  className="wishlist-icon" 
                  onClick={() => handleWishlistClick(car._id)}
                >
                  {isWishlisted ? (
                    <FaHeart style={{ color: "red" }} />
                  ) : (
                    <FaRegHeart style={{ color: "black" }} />
                  )}
                </div>

                <div className="car-image-container">
                  <img
                    src={`${API_BASE_URL}/${car.image?.replace(/^\//, '')}`}
                    alt={`${car.brand} ${car.model}`}
                    className="car-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${API_BASE_URL}/uploads/default-car-image.jpg`;
                    }}
                  />
                </div>

                <div className="car-details">
                  <h3>{car.brand} {car.model}, {car.year}</h3>
                  <p className="car-price">${car.price}/hr</p>
                </div>

                <div className="car-buttons">
                  <button
                    className={`cart-button ${isInCart ? "in-cart" : ""}`}
                    onClick={() => handleCartClick(car)}
                    disabled={isCartLoading}
                  >
                    {isInCart ? (
                      <div className="striked-cart">
                        <FaShoppingCart />
                        <div className="strike-line"></div>
                      </div>
                    ) : (
                      <FaShoppingCart />
                    )}
                  </button>
                  <button
                    className="learn-more-button"
                    onClick={() => handleLearnMore(car)}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && selectedCar && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-button" onClick={handleCloseModal}>
              ×
            </button>
            <div className="modal-car-image-container">
              <img
                src={`${API_BASE_URL}/${selectedCar.image?.replace(/^\//, '')}`}
                alt={`${selectedCar.brand} ${selectedCar.model}`}
                className="modal-car-image"
              />
            </div>
            <h2>{selectedCar.brand} {selectedCar.model}</h2>
            <p>Type: {selectedCar.type}</p>
            <p>Mileage: {selectedCar.mileage}</p>
            <p>Price: ${selectedCar.price}/hr</p>
            <p>Availability: {selectedCar.availability}</p>
            <div className="modal-buttons">
              <button
                className={`cart-button2 ${
                  cartItems.some(item => item._id === selectedCar._id) ? "in-cart" : ""
                }`}
                onClick={() => handleCartClick(selectedCar)}
                disabled={isCartLoading}
              >
                {cartItems.some(item => item._id === selectedCar._id)
                  ? <div className="striked-cart">
                      <FaShoppingCart />
                      <div className="strike-line"></div>
                    </div>
                  : <FaShoppingCart />}
              </button>
              <button 
                className="book-now-button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsBookingModalOpen(true);
                }}
              >
                Book Now
              </button>
            </div>
            <div className="owner-details">
              <h3>Owner Details</h3>
              <p>Name: {selectedCar.owner?.firstName || "N/A"}</p>
              <p>Phone: {selectedCar.owner?.phoneNumber || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {isBookingModalOpen && selectedCar && (
        <BookingModal
          car={selectedCar}
          onClose={() => setIsBookingModalOpen(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
};

export default Catalog;