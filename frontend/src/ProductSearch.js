import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import title from './title.png';

function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const searchProduct = () => {
    if (!searchTerm.trim()) {
      setMessage('Please enter a product name');
      return;
    }

    setLoading(true);
    setMessage('Searching for product...');
    
    fetch('http://localhost:5000/api/product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productName: searchTerm })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(`Successfully added ${data.added}mL of water from ${searchTerm}!`);
        setSearchTerm('');
      }
    })
    .catch(err => {
      setLoading(false);
      setMessage('An error occurred. Please try again.');
      console.error(err);
    });
  };

  return (
    <div style={{
      backgroundColor: '#d6f0ff',
      height: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <img
        src={title}
        alt="Title"
        style={{
          marginTop: '30px',
          width: '550px'
        }}
      />
      
      <div style={{
        marginTop: '80px',
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '30px',
        width: '80%',
        maxWidth: '600px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', color: '#2196F3', marginBottom: '30px' }}>
          Product Water Search
        </h2>
        
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          Search for water products by name (like Evian, Dasani, etc.) to log water intake.
        </p>
        
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter product name..."
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '25px 0 0 25px',
              border: '1px solid #ccc',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <button
            onClick={searchProduct}
            disabled={loading}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '0 25px 25px 0',
              border: 'none',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {message && (
          <div style={{
            padding: '15px',
            backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
      </div>
      
      <Link to="/">
        <button style={{
          marginTop: '30px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          Back to Water Tracker
        </button>
      </Link>
    </div>
  );
}

export default ProductSearch;