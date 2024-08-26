import React, { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import ActionScreen from "./components/ActionScreen";
import "./style.css";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<
    "home" | "video" | "photo"
  >("home");
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null); // Add stream state

  const navigateHome = () => {
    setCurrentScreen("home");
    setUploadedPhoto(null); // Reset the uploaded photo when navigating back home
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // Stop the stream when navigating home
      setStream(null);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "video":
        return (
          <ActionScreen
            screenType="video"
            navigateHome={navigateHome}
            uploadedPhoto={null}
            stream={stream} // Pass stream to ActionScreen
          />
        );
      case "photo":
        return (
          <ActionScreen
            screenType="photo"
            navigateHome={navigateHome}
            uploadedPhoto={uploadedPhoto}
            stream={stream} // Pass stream to ActionScreen
          />
        );
      default:
        return (
          <HomeScreen
            setCurrentScreen={setCurrentScreen}
            setUploadedPhoto={setUploadedPhoto}
            setStream={setStream} // Pass setStream to HomeScreen
          />
        );
    }
  };

  return <div className="modal-overlay">{renderScreen()}</div>;
};

export default App;
