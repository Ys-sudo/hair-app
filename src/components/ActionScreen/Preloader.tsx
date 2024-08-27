import React from "react";

const Preloader: React.FC = () => {
  return (
    <div id="preload" className="preloader-overlay">
      <div className="preloader-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#fff"
          strokeWidth="10"
        >
          <circle cx="50" cy="50" r="45" strokeOpacity="0.5" />
          <circle
            cx="50"
            cy="50"
            r="45"
            strokeDasharray="283"
            strokeDashoffset="0"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="283"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke"
              values="#fff;#888;#fff"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    </div>
  );
};

export default Preloader;
