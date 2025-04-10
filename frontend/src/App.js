import React, { useState, useEffect } from 'react';
import water from './water.png';
import manualButton from './manualbutton.png';
import addamount from './addamount.png';
import title from './title.png';
import reset from './reset.png';
import aiText from './aiText.png';

function App() {
  // Use React state to track total water and recommended intake
  const [globalTotalWater, setGlobalTotalWater] = useState(0);
  const [recommendedIntake, setRecommendedIntake] = useState(null);
  
  // Function to add water manually when the manual button is clicked
  const addWater = () => {
    const input = window.prompt("Enter water drank in mL: ");

    // Convert the input string to a number
    const amount = parseFloat(input);
    
    // Check if the input is a valid number
    if (!isNaN(amount)) {
      // Send a POST request to the Flask backend with the water amount
      fetch('http://localhost:5000/api/water', {
        method: 'POST',  // Use POST to send data
        headers: {
          'Content-Type': 'application/json',  // Tell the server we're sending JSON
        },
        // Convert our data (water amount) to a JSON string before sending
        body: JSON.stringify({ 
          waterValue: amount,
          recommendedIntake: recommendedIntake 
        })
      })
      .then(response => response.json())  // Parse the JSON response from the backend
      .then(data => {
        // Update the state with the new total water from the backend
        setGlobalTotalWater(data.totalWater);
      })
    } else {
      // If the input is not a valid number, show an error message
      alert("The input is not a valid number.");
    }
  };

  // Function to reset the total water to 0 when the reset button is clicked
  const resetWater = () => {
    // Send a POST request
    fetch('http://localhost:5000/api/reset', {
      method: 'POST',  // Use POST to send the reset command
      headers: {
        'Content-Type': 'application/json',  // Sending JSON
      }
    })
    .then(response => response.json())  // Parse the JSON response
    .then(data => {
      // Update the state with the new total (should be 0)
      setGlobalTotalWater(data.totalWater);
      alert("Water intake has been reset");
    })
  };

  // Function to get the recommended daily water intake from ai API
  const getRecommendedWater = () => {
    // Get user information using prompts
    const height = parseFloat(window.prompt("Enter your height in ft (e.g., '6ft 3'):"));
    const weight = parseFloat(window.prompt("Enter your weight in lbs:"));
    const age = parseFloat(window.prompt("Enter your age:"));
    const gender = window.prompt("Enter your gender (male/female):");
    
    // Send request to the backend
    fetch('http://localhost:5000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        height: height,
        weight: weight,
        age: age,
        gender: gender.toLowerCase()
      })
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.recommendedWater) {
        // Store the recommended water intake in state
        setRecommendedIntake(parseFloat(data.recommendedWater));
        alert(`Recommended daily water intake: ${data.recommendedWater} mL`);
      }
    })
  };

  // Fetch initial water total from the backend
  useEffect(() => {
    // Send POST request with waterValue of 0 to get the current total
    fetch('http://localhost:5000/api/water', {
      method: 'POST',  // Use POST to interact with our API
      headers: {
        'Content-Type': 'application/json',  // Tell the server we're sending JSON
      },
      body: JSON.stringify({ 
        waterValue: 0,
        recommendedIntake: recommendedIntake 
      })
    })
    .then(response => response.json())
    .then(data => {
      // Update state with the initial total
      setGlobalTotalWater(data.totalWater);
      if (data.recommendedIntake) {
        setRecommendedIntake(data.recommendedIntake);
      }
    })
  }, []);

  return (
    <div style={{
      backgroundColor: '#d6f0ff',
      height: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <div 
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
        src={manualButton}
        alt="Water Recommendation"
        style={{
          cursor: 'pointer',
          position: 'absolute',
          top: '50%',
          left: '83%',
          width: '150px'
        }}
        onClick={getRecommendedWater}
      />

      <img 
        src={aiText} 
        alt="Add amount" 
        style={{
          position: 'absolute',
          left: '80%',
          top: '44%',
          width: '225px'
        }} 
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