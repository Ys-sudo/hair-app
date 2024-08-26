import React from "react";

const DownloadScreen: React.FC = () => {
  const hidePhoto = () => {
    // Logic to hide the download container or navigate away
  };

  const downloadMergedImage = () => {
    // Logic to download the image, replacing this with actual functionality
    console.log("Download image");
  };

  return (
    <div id="download-container" style={{ display: "flex" }}>
      <button className="close-button" id="hide-img-button" onClick={hidePhoto}>
        &times;
      </button>
      <div style={{ textAlign: "center" }}>
        <img id="mergedImage" src="" alt="Download image" />
        <button className="up" id="downloadBtn" onClick={downloadMergedImage}>
          Download
        </button>
        <button className="up" id="closeBtn" onClick={hidePhoto}>
          Close
        </button>
        <p
          style={{
            fontSize: "12px",
            margin: "10px 15px",
            color: "white",
            textAlign: "left",
          }}
        >
          <sup>*</sup>
          <b>We do not save your photos anywhere</b>.<br />
          So if you value your privacy, you have no reason to worry.
        </p>
      </div>
    </div>
  );
};

export default DownloadScreen;
