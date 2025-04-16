import React, { useState } from "react";
import RenterHeader from "./RenterHeader";
import "../styles/RenterDashboard.css";

const RenterDashboard = () => {
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <div className="renter-dashboard">
      <RenterHeader setActiveTab={setActiveTab} />
      
      <main className="dashboard-main">
        {activeTab === "Home" && (
          <div className="welcome-section">
            <h2>Welcome to Car Rental Management System</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default RenterDashboard;