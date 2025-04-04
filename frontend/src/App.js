import React from 'react'; 
import water from './water.png'; 
import manualButton from './manualbutton.png'; 
import addAmount from './addamount.png';

function App() {
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
          position: 'absolute',  
          top: '670px',          
          left: '30px',         
          width: '150px'         
        }} 
      />
    </div>
  );
}

export default App; 