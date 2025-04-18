import React, { useState, useEffect } from "react";
import OwnerHeader from "./OwnerHeader";
import { fetchUserDetails, updateUserDetails } from "../api"; // Import the API functions
import "../styles/AccountInfo.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AccountInfo = () => {
  const [user, setUser] = useState({
    userId: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "", // Add password field
  });
  const [editableUser, setEditableUser] = useState({ ...user });

  // Fetch user details when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          console.log("Fetching user details...");
          const response = await fetchUserDetails(token);
          console.log("User details fetched:", response.data);
          setUser(response.data);
          setEditableUser(response.data); // Pre-fill the form fields
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      } else {
        console.error("No token found in localStorage");
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser({ ...editableUser, [name]: value });
  };

  // Handle update button click
  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await updateUserDetails(token, editableUser);
        console.log("Updated User Data:", response.data);
        toast.success("Account information updated successfully!");
      } catch (error) {
        console.error("Error updating user details:", error);
        toast.error("Failed to update account information.");
      }
    }
  };

  return (
    <div className="account-info-container">
      <OwnerHeader />
      <ToastContainer />
      <div className="account-info-content">
        <h2>Account Information</h2>
        <div 
  className="form-container" 
  style={{ 
    marginTop: "25px" // Corrected: Added quotes and camelCase property name
  }}
>{/* Container for form fields */}
          <form>
            <div className="form-group"  style={{ 
    marginTop: "20px" // Corrected: Added quotes and camelCase property name
  }}>
              <label>User ID</label>
              <input
                type="text"
                value={editableUser.userId || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editableUser.email || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={editableUser.firstName || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={editableUser.lastName || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={editableUser.phoneNumber || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={editableUser.password || ""}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
            </div>
            <button
              type="button"
              className="update-button"
              style={{ 
                width: "50%", // Corrected: Added quotes around the value and a comma
                marginLeft: "45px" // Corrected: Added quotes and units
              }}
              onClick={handleUpdate}
            >
              Update
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;