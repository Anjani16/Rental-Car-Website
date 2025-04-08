import React, { useEffect, useState } from 'react';
import { 
  fetchWishlistedCars, 
  toggleWishlist, 
  getUserIdFromToken, 
  fetchCartItems, 
  addToCart, 
  removeFromCart 
} from '../api';
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../styles/Catalog.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

const Wishlist = () => {
  const [wishlistedCars, setWishlistedCars] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [cars, cartData] = await Promise.all([
          fetchWishlistedCars(),
          userId ? fetchCartItems().catch(() => []) : Promise.resolve([])
        ]);
        
        setWishlistedCars(cars);
        setCartItems(cartData);
      } catch (error) {
        console.error('Error fetching wishlisted cars or cart items:', error);
        setError("Failed to load wishlist. Please try again later.");
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

  const handleWishlistClick = async (carId) => {
    if (!userId) {
      alert("Please login to manage your wishlist");
      return;
    }

    try {
      const updatedCar = await toggleWishlist(carId);
      setWishlistedCars(prevCars => 
        prevCars.filter(car => car._id !== updatedCar.car._id)
      );
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setError("Failed to update wishlist. Please try again.");
    }
  };

  const handleCartClick = async (car) => {
    if (!userId) {
      alert("Please login to manage your cart");
      return;
    }

    setIsCartLoading(true);
    try {
      const isInCart = cartItems.some(item => item._id === car._id);

      if (isInCart) {
        await removeFromCart(car._id);
        setCartItems(prev => prev.filter(item => item._id !== car._id));
        
        // Update wishlisted cars state to reflect cart status
        setWishlistedCars(prev => prev.map(c => 
          c._id === car._id ? {
            ...c,
            cartedBy: (c.cartedBy || []).filter(item => item.userId.toString() !== userId)
          } : c
        ));
      } else {
        const response = await addToCart(car._id, 1);
        setCartItems(prev => [...prev, { ...car, hours: 1 }]);
        
        // Update wishlisted cars state to reflect cart status
        setWishlistedCars(prev => prev.map(c => 
          c._id === car._id ? {
            ...c,
            cartedBy: [...(c.cartedBy || []), { userId, hours: 1 }]
          } : c
        ));
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setError(`Failed to update cart: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsCartLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading-message">Loading wishlist...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="catalog">
      <div className="catalog-header">
        <h2>Your Wishlist</h2>
      </div>

      <div className="car-grid">
        {wishlistedCars.length === 0 ? (
          <div className="no-cars-message">
            No cars in your wishlist. Start adding some from the catalog!
          </div>
        ) : (
          wishlistedCars.map((car) => {
            const isInCart = cartItems.some(item => item._id === car._id);

            return (
              <div key={car._id} className="car-tile">
                <div 
                  className="wishlist-icon" 
                  onClick={() => handleWishlistClick(car._id)}
                >
                  <FaHeart style={{ color: "red" }} />
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
          })
        )}
      </div>

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
                {cartItems.some(item => item._id === selectedCar._id) ? (
                  <div className="striked-cart">
                    <FaShoppingCart />
                    <div className="strike-line"></div>
                  </div>
                ) : (
                  <FaShoppingCart />
                )}
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

export default Wishlist;