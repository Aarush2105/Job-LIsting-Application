import React from 'react';
import './card.css'; // Import the CSS file for styling

const Card = ({ children , className ,style}) => {
  return (
    <div className={className ?"className" : "card"} style={style ? style : undefined}>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;