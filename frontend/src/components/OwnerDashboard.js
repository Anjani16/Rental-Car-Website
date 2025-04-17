import React, { useState } from "react";
import OwnerHeader from "./OwnerHeader"; // Ensure correct path
import "../styles/OwnerDashboard.css"; // Ensure correct path

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("Home"); // Default to Home

  return (
    <div className="dashboard-container" >
      <OwnerHeader setActiveTab={setActiveTab} />
      <main className="dashboard-main">
        {activeTab === "Home" && (
          <div className="welcome-section" style={{marginTop:"0%"}}>
            <h2>Welcome to Car Rental Management System!</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
