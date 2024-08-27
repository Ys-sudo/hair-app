import React, { useEffect, useRef, useState } from "react";
import { ImageSegmenter } from "../../vision_bundle";

interface SmartPhotoProps {
  imageSegmenter: InstanceType<typeof ImageSegmenter> | null;
  setRunningMode: React.Dispatch<React.SetStateAction<"IMAGE" | "VIDEO">>;
  uploadedPhoto: File | null;
  maskColor: Array<number>; // Color used for the mask
}

const SmartPhoto: React.FC<SmartPhotoProps> = ({
  imageSegmenter,
  setRunningMode,
  uploadedPhoto,
  maskColor,
}) => {
  const canvas3Ref = useRef<HTMLCanvasElement | null>(null);
  const canvas3aRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const photoSegmentRef = useRef<HTMLDivElement | null>(null);

  const [segmentationResult, setSegmentationResult] = useState<any>(null); // To store the segmentation result

  const isMobile = () => window.innerWidth <= 768;

  useEffect(() => {
    if (imageSegmenter) {
      setRunningMode("IMAGE");
    }
  }, [imageSegmenter, setRunningMode]);

  useEffect(() => {
    if (uploadedPhoto && imageSegmenter) {
      loadAndHandlePhoto(uploadedPhoto);
    } else {
      // Hide the image if no photo is uploaded
      if (imgRef.current) {
        imgRef.current.style.display = "none";
      }
      setSegmentationResult(null); // Reset segmentation result when no photo is uploaded
    }
  }, [uploadedPhoto, imageSegmenter]);

  useEffect(() => {
    if (segmentationResult) {
      let tempVal = (document.getElementById("sliderP") as HTMLInputElement)
        .value;
      (document.getElementById("sliderP") as HTMLInputElement).value = "375";
      window.beforeAfterSegmentP();
      applyMask(segmentationResult.categoryMask);
      (document.getElementById("sliderP") as HTMLInputElement).value = tempVal;
      window.beforeAfterSegmentP();
    }
  }, [maskColor, segmentationResult]); // Re-apply mask whenever maskColor or segmentationResult changes

  const loadAndHandlePhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (imgRef.current) {
        imgRef.current.onload = () => {
          console.log("Image loaded:", imgRef.current);
          const width = imgRef.current?.width;
          const height = imgRef.current?.height;
          let aspectRatio;
          if (width && height) {
            aspectRatio = width / height;
          }
          //alert(aspectRatio);
          const container = document.getElementById("photoSegment");
          // Check if the aspect ratio is close to 16:9, 4:3, or 1:1
          if (container && aspectRatio && isMobile()) {
            if (Math.abs(aspectRatio - 0.56) < 0.01) {
              // Apply transformations for 16:9 ratio if needed
              container.style.transform = "scale(1) translate(0px, 70px)";
              // Add any transformations needed for 16:9 images
            } else if (Math.abs(aspectRatio - 0.75) < 0.01) {
              // Apply transformations for 4:3 ratio
              container.style.transform = "scale(1.23) translate(0px, -40px)";
            } else if (Math.abs(aspectRatio - 1) < 0.01) {
              // Apply transformations for 1:1 ratio (square)
              container.style.transform = "scale(1.6) translate(0px, -115px)";
            } else {
              container.style.transform = "scale(1) translate(0px, 70px)";
            }
          }
          if (imgRef.current) {
            imgRef.current.style.display = "block"; // Show the image when it's loaded
          }
          //workaround for mobile ios safari
          setTimeout(handlePhoto, 500);
          setTimeout(handlePhoto, 501);
          setTimeout(handlePhoto, 502);
        };
        imgRef.current.src = e.target?.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhoto = async () => {
    if (
      !imgRef.current ||
      !canvas3Ref.current ||
      !canvas3aRef.current ||
      !imageSegmenter
    ) {
      console.log("One of the required elements is not initialized");
      return;
    }
    //window.savedImageData = null;

    const canvasPhoto = canvas3Ref.current!;
    const canvasPhotoA = canvas3aRef.current!;
    const userImg = imgRef.current!;

    canvasPhoto.width = userImg.width;
    canvasPhoto.height = userImg.height;

    canvasPhotoA.width = userImg.width;
    canvasPhotoA.height = userImg.height;

    const resizeImage = () => {
      const cxt = canvasPhoto.getContext("2d")!;
      const cxtA = canvasPhotoA.getContext("2d")!;

      cxt.clearRect(0, 0, canvasPhoto.width, canvasPhoto.height);
      cxtA.clearRect(0, 0, canvasPhotoA.width, canvasPhotoA.height);

      cxt.drawImage(userImg, 0, 0, canvasPhoto.width, canvasPhoto.height);

      const resizedImg = new Image();
      resizedImg.src = canvasPhoto.toDataURL();
      resizedImg.width = userImg.width;
      resizedImg.height = userImg.height;

      return resizedImg;
    };

    const resizedImg = resizeImage();

    // Ensure the segmenter is in IMAGE mode
    await imageSegmenter.setOptions({ runningMode: "IMAGE" });

    // Perform segmentation and process the result
    if (resizedImg) {
      const result = await imageSegmenter.segment(resizedImg);
      setSegmentationResult(result); // Store the result for re-use
      applyMask(result.categoryMask);
    }
  };

  const applyMask = (mask: any) => {
    const canvasPhoto = canvas3Ref.current!;
    const canvasPhotoA = canvas3aRef.current!;
    const cxt = canvasPhoto.getContext("2d")!;
    const cxtA = canvasPhotoA.getContext("2d")!;

    if (!cxt || !cxtA) return;
    window.savedImageData = null;
    const width = canvasPhoto.width;
    const height = canvasPhoto.height;

    const imageData = cxt.createImageData(width, height);
    const imageDataA = cxtA.createImageData(width, height);

    const maskData = mask.getAsUint8Array();

    const rgbaColor = maskColor; // Parse the new mask color

    for (let i = 0; i < maskData.length; i++) {
      const maskVal = maskData[i];
      const baseIndex = i * 4;

      if (maskVal === 1) {
        imageData.data[baseIndex] = rgbaColor[0];
        imageData.data[baseIndex + 1] = rgbaColor[1];
        imageData.data[baseIndex + 2] = rgbaColor[2];
        imageData.data[baseIndex + 3] = rgbaColor[3] || 255;
      } else {
        imageData.data[baseIndex] = 0;
        imageData.data[baseIndex + 1] = 0;
        imageData.data[baseIndex + 2] = 0;
        imageData.data[baseIndex + 3] = 0;
      }
    }

    cxt.clearRect(0, 0, width, height);
    cxt.putImageData(imageData, 0, 0);

    for (let i = 0; i < maskData.length; i++) {
      const maskVal = maskData[i];
      const baseIndex = i * 4;

      if (maskVal === 1) {
        imageDataA.data[baseIndex] = rgbaColor[0] * 0.5;
        imageDataA.data[baseIndex + 1] = rgbaColor[1] * 0.5;
        imageDataA.data[baseIndex + 2] = rgbaColor[2] * 0.5;
        imageDataA.data[baseIndex + 3] = rgbaColor[3] || 255;
      } else {
        imageDataA.data[baseIndex] = 0;
        imageDataA.data[baseIndex + 1] = 0;
        imageDataA.data[baseIndex + 2] = 0;
        imageDataA.data[baseIndex + 3] = 0;
      }
    }

    // Apply a stronger mask effect to canvas3a
    cxtA.clearRect(0, 0, width, height);
    cxtA.putImageData(imageDataA, 0, 0);
    window.beforeAfterSegmentP();
  };

  return (
    <div id="smart-photo" style={{ display: "block" }}>
      <div
        id="photoSegment"
        style={{ position: "relative" }}
        ref={photoSegmentRef}
      >
        <div id="photo-booth">
          <canvas
            ref={canvas3Ref}
            id="canvas3"
            style={{
              position: "absolute",
              zIndex: 2,
              opacity: 1,
              filter: "blur(10px)",
              mixBlendMode: "soft-light",
            }}
          ></canvas>
          <canvas
            ref={canvas3aRef}
            id="canvas3a"
            style={{
              position: "absolute",
              zIndex: 1,
              opacity: 1,
              filter: "blur(10px)",
              mixBlendMode: "soft-light",
            }}
          ></canvas>
          <div
            id="draggableBorderP"
            style={{ display: "none" }}
            className="draggable-border"
          ></div>
          <img
            ref={imgRef}
            id="users-photo"
            src=""
            style={{
              width: "100%",
              display: uploadedPhoto ? "block" : "none",
            }}
            crossOrigin="anonymous"
            alt="User's face"
          />
        </div>
      </div>
    </div>
  );
};

export default SmartPhoto;
