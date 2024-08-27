import React, { useEffect, useRef, useState } from "react";
import { ImageSegmenter } from "../../vision_bundle";

interface SmartWebcamProps {
  imageSegmenter: InstanceType<typeof ImageSegmenter> | null;
  setRunningMode: React.Dispatch<React.SetStateAction<"IMAGE" | "VIDEO">>;
  maskColor: Array<number>;
  stream: MediaStream | null;
}

const SmartWebcam: React.FC<SmartWebcamProps> = ({
  imageSegmenter,
  setRunningMode,
  maskColor,
  stream,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvas1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvas1aRef = useRef<HTMLCanvasElement | null>(null);
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);

  const [webcamRunning, setWebcamRunning] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const lastWebcamTimeRef = useRef(-1);

  // Use a ref to store the latest maskColor without causing re-renders
  const maskColorRef = useRef<Array<number>>(maskColor);
  // Update the ref value whenever maskColor changes
  useEffect(() => {
    maskColorRef.current = maskColor;
  }, [maskColor]);

  // This effect will start the webcam when imageSegmenter and stream are ready
  useEffect(() => {
    if (imageSegmenter && stream) {
      setRunningMode("VIDEO");
      startWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [imageSegmenter, stream]);

  // This effect will run the predictWebcam when both imageSegmenter and video are ready
  useEffect(() => {
    if (webcamRunning && videoReady && imageSegmenter) {
      predictWebcam();
    }
  }, [webcamRunning, videoReady, imageSegmenter]);

  const startWebcam = async () => {
    try {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => {
              setWebcamRunning(true);
              setVideoReady(true); // Set videoReady when video is playing
            })
            .catch((error) => {
              console.error("Error playing video:", error);
            });
        };

        videoRef.current.addEventListener("playing", () => {
          setVideoReady(true);
        });
      } else {
        console.error("Video element or stream is not available.");
      }
    } catch (error) {
      console.error("Error starting webcam:", error);
    }
  };

  const stopWebcam = () => {
    setWebcamRunning(false);
    setVideoReady(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  const predictWebcam = async () => {
    if (!imageSegmenter || !videoRef.current) {
      return;
    }

    //window.savedImageData = null;
    window.savedImageDataV = null;

    const video = videoRef.current;
    const canvas1 = canvas1Ref.current;
    const canvas1a = canvas1aRef.current;
    const canvas2 = canvas2Ref.current;

    if (!canvas1 || !canvas1a || !canvas2) {
      console.error("One or more canvases are not available.");
      return;
    }

    const canvasCtx = canvas1.getContext("2d", { willReadFrequently: true });
    //const canvasCtxa = canvas1a.getContext("2d", { willReadFrequently: true });
    const canvasCtx2 = canvas2.getContext("2d", { willReadFrequently: true });

    if (video.currentTime === lastWebcamTimeRef.current) {
      if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
      }
      return;
    }

    lastWebcamTimeRef.current = video.currentTime;

    // Clear and draw the video frame onto the secondary canvas
    canvasCtx?.clearRect(0, 0, video.videoWidth, video.videoHeight);
    canvasCtx2?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const startTimeMs = performance.now();
    await imageSegmenter.segmentForVideo(video, startTimeMs, callbackForVideo);
  };

  const callbackForVideo = (result: any) => {
    const video = videoRef.current;
    const canvas1 = canvas1Ref.current;
    const canvas1a = canvas1aRef.current;
    const canvas2 = canvas2Ref.current;

    const canvasCtx = canvas1?.getContext("2d");
    const canvasCtxa = canvas1a?.getContext("2d");

    if (webcamRunning && canvas1 && canvas2 && video) {
      canvas1.style.display = "flex";
      canvas2.style.display = "flex";

      const imageData = canvasCtx?.getImageData(
        0,
        0,
        video.videoWidth,
        video.videoHeight
      )?.data;
      const mask = result.categoryMask.getAsFloat32Array();

      let j = 0;
      for (let i = 0; i < mask.length; ++i) {
        const maskVal = Math.round(mask[i] * 255.0);
        if (!maskVal) {
          j += 4;
        } else {
          const [r, g, b, a] = maskColorRef.current;
          imageData![j] = r + imageData![j];
          imageData![j + 1] = g + imageData![j + 1];
          imageData![j + 2] = b + imageData![j + 2];
          imageData![j + 3] = a;
          j += 4;
        }
      }
      const uint8Array = new Uint8ClampedArray(imageData!.buffer);
      const dataNew = new ImageData(
        uint8Array,
        video.videoWidth,
        video.videoHeight
      );

      canvasCtx!.imageSmoothingEnabled = true;
      canvasCtx?.putImageData(dataNew, 0, 0);
      canvasCtxa?.putImageData(dataNew, 0, 0);

      window.requestAnimationFrame(predictWebcam);
    } else {
      if (canvas1) canvas1.style.display = "none";
      if (canvas2) canvas2.style.display = "none";
    }
  };

  return (
    <div className="smart-webcam" id="smart-webcam" style={{ display: "flex" }}>
      <canvas
        id="canvas1"
        ref={canvas1Ref}
        width="640"
        height="480"
        style={{
          position: "relative",
          zIndex: 100,
          opacity: 0.75,
          filter: "blur(10px)",
          mixBlendMode: "soft-light",
        }}
      ></canvas>
      <canvas
        id="canvas1a"
        ref={canvas1aRef}
        width="640"
        height="480"
        style={{
          position: "absolute",
          zIndex: 99,
          opacity: 0.75,
          filter: "blur(10px)",
          mixBlendMode: "soft-light",
        }}
      ></canvas>
      <div
        id="draggableBorderV"
        style={{ display: "none" }}
        className="draggable-border"
      ></div>
      <canvas
        id="canvas2"
        ref={canvas2Ref}
        width="640"
        height="480"
        style={{ display: "none", position: "absolute", zIndex: 1 }}
      ></canvas>
      <video
        id="webcam"
        ref={videoRef}
        width="640"
        height="480"
        playsInline
        style={{ display: "none", zIndex: -1 }}
      ></video>
    </div>
  );
};

export default SmartWebcam;
