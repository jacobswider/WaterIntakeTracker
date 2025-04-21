import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import water from './water.png';
import title from './title.png';
import ProductSearch from './ProductSearch';

function HomePage() {
  const [globalTotalWater, setGlobalTotalWater] = useState(0);
  const [recommendedIntake, setRecommendedIntake] = useState(null);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [hoveredFavorite, setHoveredFavorite] = useState(null);

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

  const addFromFavorite = (favoriteId) => {
    fetch('http://localhost:5000/api/add-from-favorite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favoriteId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        setGlobalTotalWater(data.totalWater);
        alert(data.message);
      }
    })
    .catch(err => {
      console.error('Error adding from favorite:', err);
      alert('An error occurred. Please try again.');
    });
  };

  const removeFavorite = (event, favoriteId) => {
    event.stopPropagation();
    fetch('http://localhost:5000/api/remove-favorite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favoriteId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        setFavoriteProducts(data.favoriteProducts);
        alert('Favorite removed successfully');
      } else {
        alert(`Error: ${data.error || 'Failed to remove favorite'}`);
      }
    })
    .catch(err => {
      console.error('Error removing favorite:', err);
      alert('An error occurred. Please try again.');
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

    fetch('http://localhost:5000/api/favorites')
      .then(res => res.json())
      .then(data => {
        if (data.favoriteProducts) {
          setFavoriteProducts(data.favoriteProducts);
        }
      })
      .catch(err => console.error('Error fetching favorites:', err));
  }, []);

  const progressPercent = recommendedIntake
    ? Math.min((globalTotalWater / recommendedIntake) * 100, 100)
    : 0;

  const progressColor = globalTotalWater >= recommendedIntake
    ? 'linear-gradient(to right, #4caf50, #388e3c)'
    : 'linear-gradient(to right, #00bcd4, #0077b6)';

  return (
    <div style={styles.pageContainer}>
      <img src={title} alt="App Title" style={styles.titleImage} />
      <div style={styles.intakeText}>
        {globalTotalWater} mL / {recommendedIntake ? `${recommendedIntake} mL` : '-- mL'}
      </div>
      <div style={styles.buttonContainer}>
        <button onClick={addWater} style={buttonStyle}>Add Water</button>
        <button onClick={resetWater} style={buttonStyle}>Reset Intake</button>
        <button onClick={getRecommendedWater} style={buttonStyle}>Get Recommendation</button>
        <Link to="/product-search">
          <button style={{ ...buttonStyle, backgroundColor: '#4caf50' }}>
            Search Products
          </button>
        </Link>
      </div>

      {/* Water Bottle */}
      <div style={styles.bottleContainer}>
        <img src={water} alt="water bottle" style={styles.bottleImage} />
        <div style={{
          ...styles.waterFill,
          clipPath: `inset(${100 - progressPercent}% 0 0 0)`,
        }} />
      </div>

      {/* Smooth Progress Bar */}
      <div style={styles.progressBar}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: progressColor,
          borderRadius: '20px 0 0 20px',
          transition: 'width 0.5s ease-in-out',
        }} />
      </div>

      {/* Favorite Products */}
      {favoriteProducts.length > 0 && (
        <div style={styles.favoritesSection}>
          <h3 style={styles.favoritesTitle}>Your Favorite Water Products</h3>
          <div style={styles.favoritesGrid}>
            {favoriteProducts.map((favorite) => (
              <div
                key={favorite.id}
                onClick={() => addFromFavorite(favorite.id)}
                onMouseEnter={() => setHoveredFavorite(favorite.id)}
                onMouseLeave={() => setHoveredFavorite(null)}
                style={{
                  ...styles.favoriteItem,
                  boxShadow: hoveredFavorite === favorite.id
                    ? '0 4px 8px rgba(0,0,0,0.2)'
                    : '0 2px 4px rgba(0,0,0,0.1)',
                  transform: hoveredFavorite === favorite.id ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <button
                  onClick={(e) => removeFavorite(e, favorite.id)}
                  style={styles.removeButton}
                >
                  ×
                </button>
                {favorite.image_url ? (
                  <img
                    src={favorite.image_url}
                    alt={favorite.name}
                    style={styles.favoriteImage}
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={styles.defaultFavoriteImage}><span style={{ fontSize: '24px' }}>💧</span></div>
                )}
                <div style={styles.favoriteName}>{favorite.name}</div>
                <div style={styles.favoriteAmount}>{favorite.amount} mL</div>
              </div>
            ))}
          </div>
        </div>
      )}
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

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#e0f7fa',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  titleImage: {
    width: '300px',
    marginBottom: '20px',
  },
  intakeText: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: '10px',
  },
  buttonContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '40px',
  },
  bottleContainer: {
    position: 'relative',
    width: '160px',
    height: '300px',
    marginBottom: '20px',
  },
  bottleImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  waterFill: {
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
    zIndex: 0,
  },
  progressBar: {
    width: '80%',
    maxWidth: '400px',
    height: '35px',
    backgroundColor: '#e0f7fa',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
    position: 'relative',
    marginBottom: '20px',
  },
  favoritesSection: {
    width: '100%',
    maxWidth: '800px',
    marginBottom: '30px',
  },
  favoritesTitle: {
    color: '#0077b6',
    textAlign: 'center',
    marginBottom: '15px',
  },
  favoritesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    justifyContent: 'center',
  },
  favoriteItem: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '140px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  removeButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: 'rgba(255,255,255,0.8)',
    color: '#ff5252',
    border: 'none',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 10,
  },
  favoriteImage: {
    width: '60px',
    height: '60px',
    objectFit: 'contain',
    marginBottom: '10px',
  },
  defaultFavoriteImage: {
    width: '60px',
    height: '60px',
    backgroundColor: '#e0f7fa',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  favoriteName: {
    fontWeight: 'bold',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '5px',
    height: '40px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  favoriteAmount: {
    backgroundColor: '#2196f3',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
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
