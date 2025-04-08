import React, { useState, useEffect } from "react";
import { fetchCartItems, removeFromCart, updateCartItem } from "../api";
import { FaTimes, FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";
import "../styles/Catalog.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await fetchCartItems();
        setCartItems(cartData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleRemoveFromCart = async (carId) => {
    try {
      await removeFromCart(carId);
      setCartItems(prev => prev.filter(item => item._id !== carId));
      if (selectedCar && selectedCar._id === carId) {
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const handleUpdateHours = async (carId, newHours) => {
    if (newHours < 1) return; // Minimum 1 hour
    
    setIsUpdating(true);
    try {
      await updateCartItem(carId, newHours);
      setCartItems(prev => 
        prev.map(item => 
          item._id === carId ? { ...item, hours: newHours } : item
        )
      );
    } catch (error) {
      console.error("Error updating hours:", error);
    } finally {
      setIsUpdating(false);
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

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.hours);
    }, 0).toFixed(2);
  };

  if (loading) return <div className="loading-message">Loading cart...</div>;

  return (
    <div className="catalog">
      <div className="catalog-header">
        <h2>Your Cart</h2>
        {cartItems.length > 0 && (
          <div className="cart-total">
            <h3>Total: ${calculateTotal()}</h3>
          </div>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="no-cars-message">
          Your cart is empty. Start adding cars from the catalog!
        </div>
      ) : (
        <div className="car-grid">
          {cartItems.map((car) => (
            <div key={car._id} className="car-tile">
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
                <p>Type: {car.type}</p>
                <p>Mileage: {car.mileage}</p>
                
                {/* Hours selection */}
                <div className="hours-selector">
                  <button 
                    onClick={() => handleUpdateHours(car._id, car.hours - 1)}
                    disabled={car.hours <= 1 || isUpdating}
                  >
                    <FaMinus />
                  </button>
                  <span>{car.hours} hour{car.hours !== 1 ? 's' : ''}</span>
                  <button 
                    onClick={() => handleUpdateHours(car._id, car.hours + 1)}
                    disabled={isUpdating}
                  >
                    <FaPlus />
                  </button>
                </div>
                <p className="item-total">
                  Item Total: ${(car.price * car.hours).toFixed(2)}
                </p>
              </div>

              <div className="car-buttons">
                <button
                  className="remove-from-cart-button"
                  onClick={() => handleRemoveFromCart(car._id)}
                >
                  <FaTimes /> Remove from cart
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
      )}

      {/* Modal for car details */}
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
            
            {/* Hours selection in modal */}
            <div className="hours-selector">
              <button 
                onClick={() => handleUpdateHours(selectedCar._id, selectedCar.hours - 1)}
                disabled={selectedCar.hours <= 1 || isUpdating}
              >
                <FaMinus />
              </button>
              <span>{selectedCar.hours} hour{selectedCar.hours !== 1 ? 's' : ''}</span>
              <button 
                onClick={() => handleUpdateHours(selectedCar._id, selectedCar.hours + 1)}
                disabled={isUpdating}
              >
                <FaPlus />
              </button>
            </div>
            <p className="item-total">
              Item Total: ${(selectedCar.price * selectedCar.hours).toFixed(2)}
            </p>
            
            <div className="modal-buttons">
              <button
                className="remove-from-cart-button"
                onClick={() => handleRemoveFromCart(selectedCar._id)}
              >
                <FaTimes /> Remove from cart
              </button>
              <button 
                className="book-now-button"
                onClick={() => navigate(`/booking/${selectedCar._id}`)}
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
    </div>
  );
};

export default Cart;