import React from "react";

const DownloadScreen: React.FC = () => {
  const hidePhoto = () => {
    const downloadContainer = document.getElementById("download-container");
    if (downloadContainer) {
      downloadContainer.style.display = "none";
    }
  };
  const downloadMergedImage = () => {
    const imgTag = document.getElementById("mergedImage") as HTMLImageElement;
    const imgURL = imgTag.src;

    // Fetch the image as a Blob
    fetch(imgURL)
      .then((response) => response.blob())
      .then((blob) => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        // Create a temporary anchor element
        const a = document.createElement("a");
        a.href = url;
        a.download = "hair-app-image.png"; // Specify the filename
        document.body.appendChild(a); // Append the anchor to the body
        a.click(); // Programmatically click the anchor to trigger the download
        document.body.removeChild(a); // Remove the anchor from the document
        // Revoke the object URL after the download is triggered
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error downloading the image:", error);
      });

    console.log("Download image");
  };

  return (
    <div id="download-container" style={{ display: "none" }}>
      <button className="close-button" id="hide-img-button" onClick={hidePhoto}>
        &times;
      </button>
      <div style={{ textAlign: "center" }}>
        <img id="mergedImage" src="" alt="Download" />
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
