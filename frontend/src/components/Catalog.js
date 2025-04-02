import React, { useState, useEffect } from "react";
import { 
  fetchAllCars, 
  toggleWishlist, 
  getUserIdFromToken,
  fetchCartItems,
  addToCart, 
  removeFromCart 
} from "../api";
import { FaHeart, FaRegHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import "../styles/Catalog.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

const Catalog = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const userId = getUserIdFromToken();

  // Fetch all cars and cart items
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch cars data
        const carsData = await fetchAllCars();
        setCars(carsData);
        setFilteredCars(carsData);
        
        // Fetch cart items if user is logged in
        if (userId) {
          try {
            const cartData = await fetchCartItems();
            setCartItems(cartData);
          } catch (cartError) {
            console.error("Error fetching cart items:", cartError);
          }
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
        setError("Failed to load cars. Please try again later.");
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

    try {
      const isInCart = cartItems.some(item => item._id === car._id);
      
      if (isInCart) {
        // Remove from cart
        await removeFromCart(car._id);
        setCartItems(prev => prev.filter(item => item._id !== car._id));
        // Update cars state to reflect removal
        setCars(prev => prev.map(c => 
          c._id === car._id 
            ? {...c, cartedBy: c.cartedBy?.filter(id => id.toString() !== userId)} 
            : c
        ));
      } else {
        // Add to cart
        await addToCart(car._id);
        setCartItems(prev => [...prev, car]);
        // Update cars state to reflect addition
        setCars(prev => prev.map(c => 
          c._id === car._id 
            ? {...c, cartedBy: [...(c.cartedBy || []), userId]} 
            : c
        ));
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      setError(`Failed to update cart: ${error.response?.data?.message || error.message}`);
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
      setError("Failed to update wishlist.");
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

  if (isLoading) {
    return <div className="loading-message">Loading cars...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="catalog">
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
            const isInCart = car.cartedBy?.includes(userId) || cartItems.some(item => item._id === car._id);

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
                      e.target.src = `${API_BASE_URL}/default-car-image.jpg`;
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
                  >
                    {isInCart ? "Remove" : <FaShoppingCart />}
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
              >
                {cartItems.some(item => item._id === selectedCar._id)
                  ? "Remove from Cart"
                  : <FaShoppingCart />}
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