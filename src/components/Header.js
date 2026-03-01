import React from 'react';
import logo from '../assets/logo.png';
import '../styles/global.css';

const Header = () => {
  return (
    <header className="app-header">
      <img src={logo} alt="Skill-Link CDO Logo" className="logo" />
      <h1>Skill-Link CDO</h1>
      <p>Connecting Skills to Opportunities</p>
    </header>
  );
};

export default Header;
