import React from 'react'; 
import water from './water.png'; 
import manualButton from './manualbutton.png'; 
import addamount from './addamount.png';
import title from './title.png';
import reset from './reset.png';

// Global variable to store total water, let creates a variable that can be changed later
let globalTotalWater = 0;

function App() {
  // This function is triggered when the manual button is clicked
  const addWater = () => {
    // Open a pop up asking to enter amount of water drank in mL
    const input = window.prompt("Enter water drank in mL: ");

    // Convert the input string to a number
    const amount = parseFloat(input);
    
    // Check if the input is a valid number
    if (!isNaN(amount)) {

      // Send a POST request to Flask backend with the water amount
      fetch('http://localhost:5000/api/water', {
        method: 'POST',  // We use POST to send data
        headers: {
          'Content-Type': 'application/json',  // Tell server we're sending JSON
        },
        // Convert our data to a JSON string before sending
        body: JSON.stringify({ waterValue: amount })
      })
      .then(response => response.json())  // Parse JSON response from the backend
      .then(data => {
        // Update the global variable with the new total water from the backend
        globalTotalWater = data.totalWater;
        
        // Update the screen with new total water drank number in mL
        document.getElementById('totalWaterDisplay').innerText = globalTotalWater + " mL";
      })
    } else {
      // If input not valid number show message
      alert("The input is not a valid number.");
    }
  };

  const resetWater = () => {
    fetch('http://localhost:5000/api/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(data => {
      // The backend returns totalWater as 0 now
      globalTotalWater = data.totalWater;
      // Update the display element with the new total
      document.getElementById('totalWaterDisplay').innerText = globalTotalWater + " mL";
      alert("Water intake has been reset");
    })
  };

  // Get initial total when component loads
  React.useEffect(() => {
    fetch('http://localhost:5000/api/water', {
      method: 'POST',  // Use POST to interact with our API
      headers: {
        'Content-Type': 'application/json',  // Tell server we're sending JSON
      },
      body: JSON.stringify({ waterValue: 0 }) // Send a JSON object with waterValue set to 0
    })
    .then(response => response.json())  // Convert response into a JSON object
    .then(data => {
      // Update global variable with the initial total
      globalTotalWater = data.totalWater;

      // Update the screen to show the updated total water
      document.getElementById('totalWaterDisplay').innerText = globalTotalWater + " mL";
    })
  }, []);

  return (
    <div style={{
      backgroundColor: '#d6f0ff', // pastel blue
      height: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div 
        id="totalWaterDisplay"
        style={{
          position: 'absolute',
          left: '50%',
          top: '29%',
          transform: 'translate(-50%, -50%)',
          fontSize: '36px',
        }}
      >
        {globalTotalWater} mL
      </div>
      
      <img 
        src={manualButton}  
        alt="Reset Button"   
        style={{
          cursor: 'pointer',   
          position: 'absolute',
          top: '670px',        
          left: '88%',       
          width: '150px'       
        }}
        onClick={resetWater}
      />

      <img 
        src={addamount} 
        alt="Add amount" 
        style={{
          position: 'absolute',                   
          top: '80%',                
          width: '225px'             
        }} 
      />
      <img 
        src={water} 
        alt="Water" 
        style={{
          position: 'absolute',      
          left: '50%',               
          top: '50%',                
          transform: 'translate(-50%, -50%)',  
          width: '350px'             
        }} 
      />
      <img 
      src={reset} 
      alt="reset" 
      style={{
        position: 'absolute', 
        left: '85%',                    
        top: '80%',                
        width: '225px'             
      }} 
      />
      <img 
        src={manualButton} 
        alt="Manual Button" 
        style={{
          cursor: 'pointer',
          position: 'absolute',  
          top: '670px',          
          left: '30px',         
          width: '150px'         
        }}
        onClick={addWater}
      />
      <img
        src={title}
        alt="Title"
        style={{
          position: 'absolute',  
          top: '75px',           
          left: '50%',   
          transform: 'translate(-50%, -50%)',    
          width: '550px'         
        }}
      />
    </div>
  );
}

export default App;