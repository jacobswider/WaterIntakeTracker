// Import React and necessary hooks
import React, { useState, useEffect, useRef } from 'react';
// Import Link component for navigation between pages
import { Link } from 'react-router-dom';
// Import title image for the app header
import title from './title.png';

function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [searchResults, setSearchResults] = useState([]);
  
  const [loading, setLoading] = useState(false);
  
  const [message, setMessage] = useState('');
  
  // State to control when to display search results
  const [showResults, setShowResults] = useState(false);
  
  // State to track which product is being hovered over
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // State to track which products have been saved as favorites
  const [savedProducts, setSavedProducts] = useState([]);

  const searchTimeoutRef = useRef(null);

  // Function to handle product search with trie backend
  const searchProduct = (searchQuery = searchTerm) => {
    // Validate that search term is not empty
    if (!searchQuery.trim()) {
      setMessage('Please enter a product name');
      return;
    }

    // Update UI to show loading state
    setLoading(true);
    setMessage('Searching for products...');
    
    // Make API request to backend search endpoint using the trie-based endpoint
    fetch(`http://localhost:5000/api/search/products?q=${encodeURIComponent(searchQuery)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(res => res.json()) // Parse JSON response
    .then(data => {
      // Update loading state when response received
      setLoading(false);
      
      if (data.error) {
        // Handle error response
        setMessage(`Error: ${data.error}`);
        setSearchResults([]);
        setShowResults(false);
      } else {
        // Process and format the search results from the trie-based endpoint
        const formattedResults = data.results.map(product => {
          const waterAmount = calculateWaterAmount(product);
          
          // Only include products with water amount less than or equal to 2000 mL
          if (waterAmount <= 2000) {
            return {
              id: product.code || product._id || `product-${Math.random().toString(36).substr(2, 9)}`,
              name: product.product_name || 'Unknown Product',
              brand: product.brands || 'Unknown Brand',
              image_url: product.image_url || product.image_front_url || null,
              amount: waterAmount
            };
          }
          return null;  // Return null for products over 2000 mL
        }).filter(Boolean);  // Filter out null values

        // Store search results and update UI
        setSearchResults(formattedResults);
        setShowResults(true);
        setMessage(`Found ${formattedResults.length} water products. Select one to add to your intake.`);
      }
    })
    .catch(err => {
      // Handle network or other errors
      setLoading(false);
      setMessage('An error occurred. Please try again.');
      console.error(err); // Log error to console for debugging
      setSearchResults([]);
      setShowResults(false);
    });
  };

  // Helper function to calculate water amount from product data
  const calculateWaterAmount = (product) => {
    let amount = 0;
    
    // Try to get quantity from product data
    const quantity_str = (product.quantity || '').toLowerCase();
    
    if (quantity_str.includes('ml')) {
      amount = parseInt(quantity_str.replace(/[^0-9]/g, '')) || 0;
    } else if (quantity_str.includes('l')) {
      try {
        const liters = parseFloat(quantity_str.replace(/[^0-9.]/g, '')) || 0;
        amount = Math.round(liters * 1000);
      } catch (e) {
        amount = 0;
      }
    }
    
    // Default water amount if we couldn't determine from data
    return amount > 0 ? amount : 500;
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search if we have at least 2 characters
    if (value.trim().length >= 2) {
      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        searchProduct(value);
      }, 500); // Wait 500ms after typing stops
    } else {
      // Clear results if search term is too short
      setSearchResults([]);
      setShowResults(false);
      setMessage('');
    }
  };


  const saveToFavorites = (product) => {
    fetch('http://localhost:5000/api/add-favorite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        brand: product.brand,
        amount: product.amount,
        image_url: product.image_url
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        // Get the latest favorites from the server response
        if (data.favoriteProducts) {
          const favoriteIds = data.favoriteProducts.map(fav => fav.id);
          setSavedProducts(favoriteIds);
        } else {
          // Fallback to just adding this product ID
          setSavedProducts(prev => [...prev, product.id]);
        }
      }
    })
    .catch(err => {
      console.error('Error saving favorite:', err);
    });
  };

  const selectProduct = (product) => {
    // Make API request to add selected product to water log
    fetch('http://localhost:5000/api/product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product.id,    // Send product ID for direct lookup
        productName: product.name // Fallback to search by name
      })
    })
    .then(res => res.json()) // Parse JSON response
    .then(data => {
      if (data.error) {
        // Handle error response
        setMessage(`Error: ${data.error}`);
      } else {
        // Show success message with the amount added
        setMessage(`Successfully added ${data.added}mL of water from ${product.name}!`);
        
        // Save the product as a favorite
        saveToFavorites(product);
      }
    })
    .catch(err => {
      // Handle network or other errors
      setMessage('An error occurred. Please try again.');
      console.error(err); // Log error to console for debugging
    });
  };

  useEffect(() => {
    // Fetch the current favorite products from the server
    fetch('http://localhost:5000/api/favorites')
      .then(res => res.json())
      .then(data => {
        if (data.favoriteProducts) {
          // Extract just the IDs for highlighting in the UI
          const favoriteIds = data.favoriteProducts.map(fav => fav.id);
          setSavedProducts(favoriteIds);
        }
      })
      .catch(err => {
        console.error('Error fetching favorites:', err);
      });
  }, []);

  // Component render function
  return (
    <div style={{
      backgroundColor: '#d6f0ff',         
      minHeight: '100vh',                 
      width: '100vw',                     
      position: 'relative',               
      overflow: 'auto',                   
      display: 'flex',                    
      flexDirection: 'column',            
      alignItems: 'center',               
      paddingBottom: '30px',              
    }}>
      {/* App title image at the top */}
      <img
        src={title}                       
        alt="Title"                       
        style={{
          marginTop: '30px',              
          width: '550px'                  
        }}
      />
      
      {/* Main content container */}
      <div style={{
        marginTop: '50px',                
        backgroundColor: 'white',         
        borderRadius: '15px',            
        padding: '30px',                  
        width: '80%',                     // Take 80% of parent width
        maxWidth: '800px',                // Maximum width limit
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)' // Subtle shadow
      }}>
        {/* Page title */}
        <h2 style={{ textAlign: 'center', color: '#2196F3', marginBottom: '30px' }}>
          Product Water Search
        </h2>
        
        {/* Instruction text */}
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          Search for water products by brand name (like Evian, Dasani, etc.) to see available options.
          Selected products will be saved to your home screen.
        </p>
        
        {/* Search input and button group */}
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          {/* Search input field with live search capability */}
          <input
            type="text"
            value={searchTerm}                               
            onChange={handleSearchInputChange}               
            placeholder="Enter water brand name..."          
            style={{
              flex: 1,                                       
              padding: '12px',                               
              borderRadius: '25px 0 0 25px',                 
              border: '1px solid #ccc',                      
              fontSize: '16px',                             
              outline: 'none'                                
            }}
          />
          {/* Search button */}
          <button
            onClick={() => searchProduct()}          
            disabled={loading}                       
            style={{
              backgroundColor: '#2196F3',            
              color: 'white',                        
              padding: '12px 20px',                  
              borderRadius: '0 25px 25px 0',         
              border: 'none',                       
              fontSize: '16px',                      // Text size
              cursor: loading ? 'not-allowed' : 'pointer' // Cursor style based on state
            }}
          >
            {loading ? 'Searching...' : 'Search'}    {/* Dynamic button text */}
          </button>
        </div>
        
        {/* Status message display - only shown when message exists */}
        {message && (
          <div style={{
            padding: '15px',                                          // Inner padding
            backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9', // Red for error, green for success
            borderRadius: '8px',                                      // Rounded corners
            marginBottom: '20px',                                     // Bottom margin
            textAlign: 'center'                                       // Center text
          }}>
            {message} {/* Display the message */}
          </div>
        )}
        
        {/* Search results - only shown when results exist */}
        {showResults && searchResults.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            {/* Results heading */}
            <h3 style={{ marginBottom: '15px', color: '#2196F3' }}>Results for "{searchTerm}":</h3>
            
            {/* Grid layout for results */}
            <div style={{ 
              display: 'grid',                                   // Use CSS Grid for layout
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Responsive grid columns
              gap: '15px'                                        // Space between grid items
            }}>
              {/* Map through search results to create product cards */}
              {searchResults.map((product, index) => (
                <div 
                  key={product.id || index}  // React key for list items (use ID or index)
                  style={{
                    border: '1px solid #e0e0e0',                 // Light border
                    borderRadius: '10px',                        // Rounded corners
                    padding: '15px',                             // Inner padding
                    display: 'flex',                             // Flexbox layout
                    flexDirection: 'column',                     // Stack children vertically
                    boxShadow: hoveredProduct === (product.id || index)   // Dynamic shadow based on hover
                      ? '0 4px 8px rgba(0,0,0,0.1)'              // Stronger shadow when hovered
                      : '0 2px 4px rgba(0,0,0,0.05)',            // Subtle shadow by default
                    backgroundColor: savedProducts.includes(product.id)  // Color background if saved
                      ? '#e3f2fd'                                // Light blue for saved products
                      : '#f9f9f9',                               // Light gray for unsaved products
                    transform: hoveredProduct === (product.id || index)   // Dynamic transform based on hover
                      ? 'scale(1.02)'                            // Slightly enlarge when hovered
                      : 'scale(1)',                              // Normal size by default
                    transition: 'transform 0.2s, box-shadow 0.2s', // Smooth transition for hover effects
                    cursor: 'pointer',                           // Hand cursor to indicate clickable
                    height: '100%',                              // Full height within grid cell
                    position: 'relative',                        // For positioning the favorite icon
                  }} 
                  onClick={() => selectProduct(product)}         // Handle click to select product
                  onMouseEnter={() => setHoveredProduct(product.id || index)} // Track mouse enter
                  onMouseLeave={() => setHoveredProduct(null)}   // Track mouse leave
                >
                  {/* Product image and details container */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    {/* Product image - only shown if image URL exists */}
                    {product.image_url && (
                      <img 
                        src={product.image_url}                  // Image source from API
                        alt={product.name}                       // Alt text using product name
                        style={{ 
                          width: '60px',                         // Image width
                          height: '60px',                        // Image height
                          objectFit: 'contain',                  // Maintain aspect ratio
                          marginRight: '10px',                   // Space between image and text
                          borderRadius: '5px'                    // Slightly rounded corners
                        }} 
                        onError={(e) => {
                          // Fallback for broken images
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    {/* Product text details */}
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{product.name}</h4>
                      <p style={{ margin: '0', color: '#666' }}>{product.brand}</p>
                    </div>
                  </div>
                  
                  {/* Water amount badge */}
                  <div style={{
                    marginTop: 'auto',                           // Push to bottom of container
                    padding: '8px 12px',                         // Inner padding
                    backgroundColor: '#2196F3',                  // Blue background
                    color: 'white',                              // White text
                    borderRadius: '20px',                        // Fully rounded corners (pill shape)
                    textAlign: 'center',                         // Center text
                    fontWeight: 'bold'                           // Bold text
                  }}>
                    {product.amount} mL                          {/* Display water amount */}
                    {/* Add text indicating click will save to favorites */}
                    <span style={{ fontSize: '12px', display: 'block', marginTop: '3px' }}>
                      Click to add & save
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* No results message - shown when search completed but no results found */}
        {showResults && searchResults.length === 0 && !loading && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#666'
          }}>
            No water products found for "{searchTerm}". Try a different search term.
          </div>
        )}
      </div>
      
      {/* Back button - links to home page */}
      <Link to="/">
        <button style={{
          marginTop: '30px',                                    // Space above button
          backgroundColor: '#2196F3',                           // Blue background
          color: 'white',                                       // White text
          border: 'none',                                       // No border
          borderRadius: '25px',                                 // Fully rounded corners
          padding: '12px 24px',                                 // Inner padding
          fontSize: '16px',                                     // Text size
          cursor: 'pointer',                                    // Hand cursor
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'               // Button shadow
        }}>
          Back to Water Tracker                                 {/* Button text */}
        </button>
      </Link>
    </div>
  );
}

export default ProductSearch;