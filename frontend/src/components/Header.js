import React, {  useContext  } from 'react';
import '../styles/Header.css'; // Create a new CSS file for header styles
import { ThemeContext } from './ThemeContext'; // Import ThemeContext



const Header = () => {

  const { theme } = useContext(ThemeContext);
  return (
    <header className={`app-header ${theme}`}>
      <h1>Car Rental Management System</h1>
    </header>
  );
};

export default Header;