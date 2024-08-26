import React, { useEffect, useState } from "react";
import UiButtons from "./UiButtons";
import SmartWebcam from "./SmartWebcam";
import SmartPhoto from "./SmartPhoto";
import Footer from "./Footer";
import { getImageSegmenter } from "../../utils/imageSegmenter";

interface ActionScreenProps {
  screenType: "video" | "photo";
  navigateHome: () => void; // Function to navigate back to home
  uploadedPhoto: File | null; // The uploaded photo
  stream: MediaStream | null; // Add this prop for the camera stream
}

// Use ReturnType to infer the type of the segmenter from the function
type ImageSegmenterType = ReturnType<typeof getImageSegmenter> extends Promise<
  infer T
>
  ? T
  : never;

const ActionScreen: React.FC<ActionScreenProps> = ({
  screenType,
  navigateHome,
  uploadedPhoto,
  stream,
}) => {
  const [maskColor, setMaskColor] = useState<Array<number>>([0, 0, 0, 0.5]);
  const [imageSegmenter, setImageSegmenter] =
    useState<ImageSegmenterType | null>(null);
  const [runningMode, setRunningMode] = useState<"IMAGE" | "VIDEO">("VIDEO");

  useEffect(() => {
    const initializeSegmenter = async () => {
      const segmenter = await getImageSegmenter(runningMode);
      setImageSegmenter(segmenter);
    };

    initializeSegmenter();
  }, [runningMode]);

  const hexToRgb = (hex: string): string => {
    hex = hex.replace(/^#/, "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const parseRgba = (color: string): number[] => {
    const [hexPart, opacityPart] = color.split(",").map((part) => part.trim());
    const rgbString = hexToRgb(hexPart);
    const rgbValues = rgbString
      .replace(/[^\d,]/g, "")
      .split(",")
      .map(Number);
    const opacity = opacityPart !== undefined ? parseInt(opacityPart, 10) : 255;
    return [...rgbValues, opacity];
  };

  const updateColor = (color: string, opacity: number) => {
    let convertedColor = parseRgba(`${color}, ${opacity}`);
    setMaskColor(convertedColor);
  };

  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    navigateHome(); // Navigate back to the home screen
  };

  return (
    <div id="modal-action" className="modal">
      <button className="close-button" id="stopBtn" onClick={handleStopCamera}>
        &times;
      </button>
      <UiButtons />
      <div
        className="modal-body"
        style={{
          width: "100%",
          position: screenType === "video" ? "relative" : "absolute",
        }}
      >
        {screenType === "video" ? (
          <SmartWebcam
            imageSegmenter={imageSegmenter}
            setRunningMode={setRunningMode}
            maskColor={maskColor}
            stream={stream}
          />
        ) : (
          <SmartPhoto
            imageSegmenter={imageSegmenter}
            setRunningMode={setRunningMode}
            uploadedPhoto={uploadedPhoto}
            maskColor={maskColor}
          />
        )}
      </div>
      <Footer updateColor={updateColor} />
    </div>
  );
};

export default ActionScreen;
