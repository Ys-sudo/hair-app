import React from "react";

interface HomeScreenProps {
  setCurrentScreen: React.Dispatch<
    React.SetStateAction<"home" | "video" | "photo">
  >;
  setUploadedPhoto: (photo: File | null) => void;
  setStream: (stream: MediaStream | null) => void; // Add this prop to manage the camera stream
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  setCurrentScreen,
  setUploadedPhoto,
  setStream,
}) => {
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(stream); // Store the stream in the parent state
      setCurrentScreen("video");
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setUploadedPhoto(file);
      setCurrentScreen("photo");
    }
  };

  const triggerInput = () => {
    document.getElementById("image-input")?.click();
  };

  return (
    <div id="modal-wrap" className="modal">
      <div className="modal-body">
        <div style={{ textAlign: "center", width: "100%" }}>
          <img
            src="/img/logo-app.png"
            width="150"
            height="150"
            alt="App Logo"
          />
        </div>
        <br />
        <h2 style={{ textTransform: "uppercase" }}>
          Hair Color App
          <br />
          Virtual try on
        </h2>
        <p>Check which hair color fits you best.</p>
      </div>
      <div className="modal-footer">
        <button
          id="webcamButton"
          className="up"
          onClick={startCamera} // Start the camera when this button is clicked
        >
          <span>Turn on the mirror</span>
        </button>
        <button id="photoButton" onClick={triggerInput} className="up">
          <input
            type="file"
            id="image-input"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoUpload}
          />
          <span>Use a photo</span>
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
