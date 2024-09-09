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
        // Use the scaleAndCropImage function here before loading the image
        scaleAndCropImage(file, 375, 620, (blob) => {
          const imgURL = URL.createObjectURL(blob);

          imgRef.current.onload = () => {
            console.log("Image loaded:", imgRef.current);

            if (imgRef.current) {
              imgRef.current.style.display = "block"; // Show the image when it's loaded
            }

            // workaround for mobile ios safari
            setTimeout(handlePhoto, 500);
            setTimeout(handlePhoto, 501);
            setTimeout(handlePhoto, 502);
          };

          // Set the processed (cropped and scaled) image URL as the src
          imgRef.current.src = imgURL;
        });
      }
    };

    reader.readAsDataURL(file);
  };

  function scaleAndCropImage(file, width, height, callback) {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
      // Type assertion to indicate this is a string (Data URL)
      img.src = e.target?.result as string;
    };

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = width / height;

      let sx, sy, sWidth, sHeight;

      // Determine the cropping dimensions based on aspect ratio
      if (imgAspectRatio > canvasAspectRatio) {
        sHeight = img.height;
        sWidth = sHeight * canvasAspectRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = img.width;
        sHeight = sWidth / canvasAspectRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      }

      // Draw the image into the canvas
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);

      // Return the cropped and scaled image as a blob
      canvas.toBlob(
        (blob) => {
          callback(blob);
        },
        "image/jpeg",
        0.95
      );
    };

    reader.readAsDataURL(file);
  }

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
