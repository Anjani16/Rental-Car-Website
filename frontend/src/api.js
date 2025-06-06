import axios from "axios";

// const API_BASE_URL = "https://rental-car-website-5iwe.onrender.com"; // Your backend server URL

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

// Utility function to extract userId from the JWT token
export const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
      return payload.userId; // Return the userId from the token
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  return null;
};

// Fetch all cars from the database
export const fetchAllCars = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cars`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cars:", error);
    throw error;
  }
};

// Add a new car
export const addCar = async (carData, token) => {
  const formData = new FormData();
  Object.keys(carData).forEach((key) => {
    formData.append(key, carData[key]);
  });

  const userId = getUserIdFromToken(); // Extract userId from the token
  if (!userId) {
    throw new Error("User ID not found in token");
  }

  // const payload = { ...carData, userId }; // Include userId in the payload
  return axios.post(`${API_BASE_URL}/api/cars`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

// Fetch cars owned by the logged-in user
export const fetchUserCars = async () => {
  const userId = getUserIdFromToken(); // Extract userId from the token
  if (!userId) {
    throw new Error("User ID not found in token");
  }

  return axios.get(`${API_BASE_URL}/api/cars/user`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

// Other API functions (registerUser, loginUser, etc.) remain unchanged
export const registerUser = async (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/auth/register`, userData);
};

export const loginUser = async (userData) => {
  return axios.post(`${API_BASE_URL}/api/users/auth/login`, userData);
};

export const fetchUserDetails = async (token) => {
  return axios.get(`${API_BASE_URL}/api/users/auth/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateUserDetails = async (token, updatedData) => {
  return axios.put(`${API_BASE_URL}/api/users/auth/user`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteAccount = async (token) => {
  return axios.delete(`${API_BASE_URL}/api/users/auth/delete-account`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const forgotPassword = async (email, newPassword) => {
  const payload = { email, newPassword };
  return axios.post(`${API_BASE_URL}/api/users/auth/forgot-password`, payload);
};

export const updateCar = async (id, carData, token) => {
  return axios.put(`${API_BASE_URL}/api/cars/${id}`, carData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteCar = async (id) => {
  return axios.delete(`${API_BASE_URL}/api/cars/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

export const fetchWishlistedCars = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cars/wishlist`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlisted cars:', error);
    throw error;
  }
};

// Toggle wishlist for a car
export const toggleWishlist = async (carId, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/cars/${carId}/wishlist`,
      {},
      {
        headers: {
          // Authorization: `Bearer ${token}`,
          Authorization: `Bearer ${localStorage.getItem('token')}`,

        },
        // headers: {
        //   Authorization: `Bearer ${localStorage.getItem('token')}`,
        // },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};
// Update these functions in api.js
export const addToCart = async (carId, hours = 1) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/cars/${carId}/cart`,
      { hours },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error.response?.data || error.message);
    throw error;
  }
};

export const updateCartItem = async (carId, hours) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/cars/${carId}/cart`,
      { hours },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating cart:', error.response?.data || error.message);
    throw error;
  }
};

export const removeFromCart = async (carId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/cars/${carId}/cart`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchCartItems = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cars/cart`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

export const fetchCarById = async (carId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cars/${carId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching car details:', error);
    throw error;
  }
};

export const getBookingsByRenter = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/api/bookings/renterhistory`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


// Add to your api.js
export const submitBooking = async (bookingData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/bookings`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting booking:', error);
    throw error;
  }
};

// GET /api/bookings/user
export const getMyBookings = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/api/bookings/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return await response.json(); // returns all bookings for user (renter or owner)
};


export const sendNotificationToOwner = async (ownerId, notification) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/notifications/${ownerId}`,
      notification,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Add this to your api.js file
export const fetchNotifications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};