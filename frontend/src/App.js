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
  },);

  const progressPercent = recommendedIntake
    ? Math.min((globalTotalWater / recommendedIntake) * 100, 100)
    : 0;

  const progressColor = globalTotalWater >= recommendedIntake
    ? 'linear-gradient(to right, #4caf50, #388e3c)' // green when goal met
    : 'linear-gradient(to right, #00bcd4, #0077b6)'; // default blue

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

          {/* Water Bottle Image */}
          <div style={{
      position: 'relative',
      width: '160px',
      height: '300px',
      marginBottom: '20px',
    }}>
  {/* Bottle Image (always visible) */}
  <img 
    src={water} 
    alt="water bottle" 
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
    }} 
  />

    {/* Water Fill (under the bottle outline) */}
    <div style={{
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to top, #007BFF, #00BFFF)',
      WebkitMaskImage: `url(${water})`,
      maskImage: `url(${water})`,
      WebkitMaskSize: '100% 100%',
      maskSize: '100% 100%',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      transition: 'clip-path 0.6s ease-in-out',
      clipPath: `inset(${100 - progressPercent}% 0 0 0)`,
      zIndex: 0,
    }} />
  </div>


      {/* Smooth Gradient Progress Bar */}
      <div style={{
        width: '80%',
        maxWidth: '400px',
        height: '35px',
        backgroundColor: '#e0f7fa',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
        position: 'relative',
        marginBottom: '20px',
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: progressColor,
          borderRadius: '20px 0 0 20px',
          transition: 'width 0.5s ease-in-out',
        }} />
      </div>

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
