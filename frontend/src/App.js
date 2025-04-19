import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import water from './water.png';
import title from './title.png';
import ProductSearch from './ProductSearch';

function HomePage() {
  const [globalTotalWater, setGlobalTotalWater] = useState(0);
  const [recommendedIntake, setRecommendedIntake] = useState(null);

  const addWater = () => {
    const input = window.prompt("Enter water drank in mL: ");
    const amount = parseFloat(input);
    if (!isNaN(amount)) {
      fetch('http://localhost:5000/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waterValue: amount, recommendedIntake })
      })
      .then(res => res.json())
      .then(data => setGlobalTotalWater(data.totalWater));
    } else {
      alert("Invalid number.");
    }
  };

  const resetWater = () => {
    fetch('http://localhost:5000/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      setGlobalTotalWater(data.totalWater);
      alert("Water intake has been reset.");
    });
  };

  const getRecommendedWater = () => {
    const height = parseFloat(window.prompt("Enter your height in ft (e.g., 6.3 for 6ft 3in):"));
    const weight = parseFloat(window.prompt("Enter your weight in lbs:"));
    const age = parseFloat(window.prompt("Enter your age:"));
    const gender = window.prompt("Enter your gender (male/female):");
    fetch('http://localhost:5000/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height, weight, age, gender: gender.toLowerCase() })
    })
    .then(res => res.json())
    .then(data => {
      if (data.recommendedWater) {
        setRecommendedIntake(parseFloat(data.recommendedWater));
        alert(`Recommended daily water intake: ${data.recommendedWater} mL`);
      }
    });
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waterValue: 0, recommendedIntake })
    })
    .then(res => res.json())
    .then(data => {
      setGlobalTotalWater(data.totalWater);
      if (data.recommendedIntake) {
        setRecommendedIntake(data.recommendedIntake);
      }
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#e0f7fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
    }}>
      
      {/* Title Image */}
      <img src={title} alt="App Title" style={{ width: '300px', marginBottom: '20px' }} />

      {/* Progress Display */}
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#0077b6',
        marginBottom: '10px',
      }}>
        {globalTotalWater} mL / {recommendedIntake ? `${recommendedIntake} mL` : `-- mL`}
      </div>

      {/* Buttons Section */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'center',
        marginBottom: '40px'
      }}>
        <button onClick={addWater} style={buttonStyle}>Add Water</button>
        <button onClick={resetWater} style={buttonStyle}>Reset Intake</button>
        <button onClick={getRecommendedWater} style={buttonStyle}>Get Recommendation</button>
        <Link to="/product-search">
          <button style={{ ...buttonStyle, backgroundColor: '#4caf50' }}>
            Search Products
          </button>
        </Link>
      </div>

      {/* Center Water Image */}
      <img src={water} alt="Water" style={{ width: '250px' }} />

    </div>
  );
}

const buttonStyle = {
  padding: '12px 20px',
  borderRadius: '25px',
  border: 'none',
  backgroundColor: '#2196f3',
  color: 'white',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background 0.3s ease',
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product-search" element={<ProductSearch />} />
      </Routes>
    </Router>
  );
}

export default App;
