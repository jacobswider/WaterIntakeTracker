import React from 'react'; 
import water from './water.png'; 
import manualButton from './manualbutton.png'; 
import addAmount from './addamount.png';

function App() {
  const addWater = () => {

    // Open a pop up asking to enter amount of water drank in mL
    const input = window.prompt("Enter water drank in mL: ");

    // Convert the input string to a number
    const amount = parseFloat(input);
    
    // Check if the input is a valid number
    if (!isNaN(amount)) {
      // If it's a valid number show message with the number
      alert("You entered: " + amount);

      fetch('http://localhost:5000/api/water', {
      method: 'POST', 
      headers : {
        'Content-Type': 'application/json',
      },
      body : JSON.stringify({ waterValue: amount})
       }
      )
      
    } else {
      // If not a valid number show message
      alert("The input is not a valid number.");
    }

  };
  return (
    <div>
      <img 
        src={addAmount} 
        alt="Add Amount" 
        style={{
          position: 'absolute',      
          left: '0px',               
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
    </div>
  );
}

export default App; 