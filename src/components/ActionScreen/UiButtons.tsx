import React, { useEffect, useState } from "react";
import Preloader from "./Preloader";

declare global {
  interface Window {
    savedImageData?: string | null;
    savedImageDataV?: string | null;
    beforeAfterSegmentP: () => void;
  }
}

const UiButtons: React.FC = () => {
  window.savedImageData = window.savedImageData || null;
  window.savedImageDataV = window.savedImageDataV || null;

  const createWorker = () => {
    return new Worker(new URL("./blurWorker.js", import.meta.url));
  };

  const [isLoading, setIsLoading] = useState(false);

  const isMobile = () => window.innerWidth <= 768;

  // Video-specific functions
  const beforeAfterSegmentV = () => {
    const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
    const canvas1a = document.getElementById("canvas1a") as HTMLCanvasElement;

    const vid = document.getElementById("canvas2") as HTMLCanvasElement;
    const imgWidth = vid.clientWidth;
    const cropPercentage = parseInt(
      (document.getElementById("sliderV") as HTMLInputElement).value
    );
    const cropWidth =
      (Math.round((cropPercentage / 640) * 100) / 100) * imgWidth;

    if (!window.savedImageDataV) {
      window.savedImageDataV = canvas.toDataURL();
    }

    canvas.style.width = cropWidth + "px";
    canvas.style.left = "0";

    canvas.width = cropWidth;
    canvas.height = vid.clientHeight;

    canvas1a.style.width = cropWidth + "px";
    canvas1a.style.left = "0";

    canvas1a.width = cropWidth;
    canvas1a.height = vid.clientHeight;
  };

  const updateVBorderPosition = (position: string) => {
    const draggableBorderV = document.getElementById("draggableBorderV")!;
    const borderVRange = document.getElementById("sliderV") as HTMLInputElement;
    draggableBorderV.style.left = `${position}px`;
    borderVRange.value = position;
    beforeAfterSegmentV();
  };

  const loadVBorder = () => {
    const draggableBorderV = document.getElementById("draggableBorderV")!;
    //const canvas = document.getElementById("webcam") as HTMLCanvasElement;
    let isDragging = false;
    let startX: number;
    let startBorderLeft: number;

    draggableBorderV.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startBorderLeft = isMobile() ? 229 : 321;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const deltaX = e.clientX - startX;
        let newLeft = startBorderLeft + deltaX;
        newLeft = Math.max(180, Math.min(newLeft, 454));
        updateVBorderPosition(newLeft.toString());
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    draggableBorderV.addEventListener("touchstart", (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      startBorderLeft = isMobile()
        ? parseInt(draggableBorderV.style.left, 10)
        : parseInt(draggableBorderV.style.left, 10);
    });

    document.addEventListener("touchmove", (e) => {
      if (isDragging) {
        const deltaX = e.touches[0].clientX - startX;
        let newLeft = startBorderLeft + deltaX;
        if (isMobile()) {
          newLeft = Math.max(87, Math.min(newLeft, 372));
        } else {
          newLeft = Math.max(190, Math.min(newLeft, 455));
        }
        updateVBorderPosition(newLeft.toString());
      }
    });

    document.addEventListener("touchend", () => {
      isDragging = false;
    });

    (document.getElementById("sliderV") as HTMLInputElement).addEventListener(
      "change",
      (e) => {
        updateVBorderPosition((e.target as HTMLInputElement).value);
      }
    );
  };

  // Photo-specific functions
  const beforeAfterSegmentP = () => {
    const canvasPhoto = document.getElementById("canvas3") as HTMLCanvasElement;
    const canvasPhotoA = document.getElementById(
      "canvas3a"
    ) as HTMLCanvasElement;
    const ctx = canvasPhoto.getContext("2d");
    const img = document.getElementById("users-photo") as HTMLImageElement;
    const imgWidth = img.clientWidth;
    const cropPercentage = parseInt(
      (document.getElementById("sliderP") as HTMLInputElement).value
    );
    const cropWidth =
      (Math.round((cropPercentage / 375) * 100) / 100) * imgWidth;

    if (window.savedImageData == null) {
      window.savedImageData = canvasPhoto.toDataURL();
    }

    canvasPhoto.style.width = cropWidth + "px";
    canvasPhoto.style.left = "0";

    canvasPhoto.width = cropWidth;
    canvasPhoto.height = img.clientHeight;

    canvasPhotoA.style.width = cropWidth + "px";
    canvasPhotoA.style.left = "0";

    canvasPhotoA.width = cropWidth;
    canvasPhotoA.height = img.clientHeight;

    const imgObj = new Image();
    imgObj.onload = function () {
      ctx?.clearRect(0, 0, canvasPhoto.width, canvasPhoto.height);
      ctx?.drawImage(
        imgObj,
        0,
        0,
        cropWidth,
        img.clientHeight,
        0,
        0,
        cropWidth,
        img.clientHeight
      );
    };
    imgObj.src = window.savedImageData!;
  };

  // Attach the function to the window object
  useEffect(() => {
    window.beforeAfterSegmentP = beforeAfterSegmentP;
  }, []);

  const updateBorderPosition = (position: string) => {
    const draggableBorder = document.getElementById("draggableBorderP")!;
    const borderPRange = document.getElementById("sliderP") as HTMLInputElement;
    draggableBorder.style.left = `${position}px`;
    borderPRange.value = position;
    beforeAfterSegmentP();
  };

  const loadPBorder = () => {
    const draggableBorder = document.getElementById("draggableBorderP")!;
    const canvas = document.getElementById("users-photo") as HTMLImageElement;
    let isDragging = false;
    let startX: number;
    let startBorderLeft: number;

    draggableBorder.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startBorderLeft = parseInt(draggableBorder.style.left, 10);
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const deltaX = e.clientX - startX;
        let newLeft = startBorderLeft + deltaX;
        newLeft = Math.max(0, Math.min(newLeft, canvas.width - 3));
        updateBorderPosition(newLeft.toString());
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    draggableBorder.addEventListener("touchstart", (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      startBorderLeft = parseInt(draggableBorder.style.left, 10);
    });

    document.addEventListener("touchmove", (e) => {
      if (isDragging) {
        const deltaX = e.touches[0].clientX - startX;
        let newLeft = startBorderLeft + deltaX;
        newLeft = Math.max(0, Math.min(newLeft, canvas.width - 3));
        updateBorderPosition(newLeft.toString());
      }
    });

    document.addEventListener("touchend", () => {
      isDragging = false;
    });

    (document.getElementById("sliderP") as HTMLInputElement).addEventListener(
      "change",
      (e) => {
        updateBorderPosition((e.target as HTMLInputElement).value);
      }
    );
  };

  // Handle separator icon click
  const handleSepIconClick = () => {
    const smartWebcam = document.getElementById("smart-webcam");
    const smartPhoto = document.getElementById("smart-photo");

    if (smartWebcam?.style.display === "flex") {
      loadVBorder();
      const draggableBorderV = document.getElementById("draggableBorderV");
      if (draggableBorderV?.style.display === "none") {
        draggableBorderV.style.display = "block";
        const sliderV = document.getElementById("sliderV") as HTMLInputElement;
        sliderV.value = isMobile() ? "229" : "321";
        beforeAfterSegmentV();
        updateVBorderPosition(sliderV.value);
      } else {
        draggableBorderV!.style.display = "none";
        (document.getElementById("sliderV") as HTMLInputElement).value = "455";
        beforeAfterSegmentV();
      }
    }

    if (smartPhoto?.style.display === "block") {
      loadPBorder();
      const draggableBorderP = document.getElementById("draggableBorderP");
      if (draggableBorderP?.style.display === "none") {
        draggableBorderP.style.display = "block";
        const sliderP = document.getElementById("sliderP") as HTMLInputElement;
        sliderP.value = "187";
        beforeAfterSegmentP();
        updateBorderPosition(sliderP.value);
      } else {
        draggableBorderP!.style.display = "none";
        (document.getElementById("sliderP") as HTMLInputElement).value = "375";
        beforeAfterSegmentP();
      }
    }
  };

  const createBlurredCanvas = (
    sourceCanvas: HTMLCanvasElement,
    blurRadius: number
  ): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      setIsLoading(true); // Show preloader

      const offScreenCanvas = document.createElement("canvas");
      const offScreenContext = offScreenCanvas.getContext("2d");

      offScreenCanvas.width = sourceCanvas.width;
      offScreenCanvas.height = sourceCanvas.height;

      if (blurRadius === 0) {
        offScreenContext?.drawImage(sourceCanvas, 0, 0);
        setIsLoading(false); // Hide preloader
        resolve(offScreenCanvas);
        return;
      }

      offScreenContext?.drawImage(sourceCanvas, 0, 0);

      const imageData = offScreenContext?.getImageData(
        0,
        0,
        offScreenCanvas.width,
        offScreenCanvas.height
      );

      if (imageData) {
        const worker = createWorker();
        worker.onmessage = function (e) {
          offScreenContext?.putImageData(e.data, 0, 0);
          setIsLoading(false); // Hide preloader
          resolve(offScreenCanvas);
          worker.terminate(); // Clean up the worker
        };
        worker.postMessage({ imageData, radius: blurRadius });
      } else {
        setIsLoading(false); // Hide preloader
        resolve(offScreenCanvas);
      }
    });
  };

  const captureScreenshot = async () => {
    const videoElement1 = document.getElementById("webcam") as HTMLVideoElement;
    videoElement1.pause();
    setIsLoading(true);
    const canvas1 = document.getElementById("canvas1") as HTMLCanvasElement;
    const canvas1a = document.getElementById("canvas1a") as HTMLCanvasElement;
    const canvas2 = document.getElementById("canvas2") as HTMLCanvasElement;

    const visibleElement = document.getElementById("modal-action"); // Update this to your main container
    const boundingRect = visibleElement?.getBoundingClientRect();

    const fullCanvas = document.createElement("canvas");
    const fullContext = fullCanvas.getContext("2d");

    const canvasWidth = Math.max(canvas1.width, canvas1a.width, canvas2.width);
    const canvasHeight = Math.max(
      canvas1.height,
      canvas1a.height,
      canvas2.height
    );
    fullCanvas.width = canvasWidth;
    fullCanvas.height = canvasHeight;

    const drawLayerWithBlur = async (
      sourceCanvas: HTMLCanvasElement,
      context: CanvasRenderingContext2D,
      blendMode: GlobalCompositeOperation,
      blurRadius: number
    ) => {
      const blurredCanvas = await createBlurredCanvas(sourceCanvas, blurRadius);
      context.globalCompositeOperation = blendMode;
      context.drawImage(blurredCanvas, 0, 0);
    };

    if (fullContext) {
      await drawLayerWithBlur(canvas2, fullContext, "source-over", 0);
      if (isMobile()) {
        await drawLayerWithBlur(canvas1, fullContext, "color", 35);
      } else {
        await drawLayerWithBlur(canvas1, fullContext, "color", 50);
      }
      await drawLayerWithBlur(canvas1a, fullContext, "soft-light", 10);
    } else {
      setIsLoading(false); // Ensure the preloader is hidden if there's an error
      return;
    }

    const croppedCanvas = document.createElement("canvas");
    const croppedContext = croppedCanvas.getContext("2d");
    if (boundingRect) {
      croppedCanvas.width = boundingRect.width;
      croppedCanvas.height = boundingRect.height;
    } else {
      setIsLoading(false); // Ensure the preloader is hidden if there's an error
      return;
    }

    const scaleX = croppedCanvas.width / fullCanvas.width;
    const scaleY = croppedCanvas.height / fullCanvas.height;
    const scale = Math.max(scaleX, scaleY);

    const offsetX = (croppedCanvas.width - fullCanvas.width * scale) / 2;
    const offsetY = (croppedCanvas.height - fullCanvas.height * scale) / 2;

    if (isMobile()) {
      const mobileScale = 1.3;
      const translateX = 0.2 * fullCanvas.width;

      croppedContext?.save();
      croppedContext?.translate(translateX, 0);
      croppedContext?.scale(mobileScale, mobileScale);

      croppedContext?.drawImage(
        fullCanvas,
        0,
        0,
        fullCanvas.width,
        fullCanvas.height,
        offsetX / mobileScale,
        offsetY / mobileScale,
        (fullCanvas.width * scale) / mobileScale,
        (fullCanvas.height * scale) / mobileScale
      );

      croppedContext?.restore();
    } else {
      croppedContext?.drawImage(
        fullCanvas,
        0,
        0,
        fullCanvas.width,
        fullCanvas.height,
        offsetX,
        offsetY,
        fullCanvas.width * scale,
        fullCanvas.height * scale
      );
    }

    const img = croppedCanvas.toDataURL("image/png");
    const mergedImage = document.getElementById(
      "mergedImage"
    ) as HTMLImageElement;
    mergedImage.src = img;

    setIsLoading(false); // Hide preloader once everything is done
    mergeVCanvasesAndDisplay(); // Assuming this is a synchronous function
    videoElement1.play();
  };

  const capturePhotoScreenshot = async () => {
    setIsLoading(true);
    const canvas3 = document.getElementById("canvas3") as HTMLCanvasElement;
    const canvas3a = document.getElementById("canvas3a") as HTMLCanvasElement;
    const usersPhoto = document.getElementById(
      "users-photo"
    ) as HTMLImageElement;

    const boundingRect = usersPhoto.getBoundingClientRect();

    const fullCanvas = document.createElement("canvas");
    const fullContext = fullCanvas.getContext("2d");

    const canvasWidth = Math.max(
      canvas3.width,
      canvas3a.width,
      usersPhoto.width
    );
    const canvasHeight = Math.max(
      canvas3.height,
      canvas3a.height,
      usersPhoto.height
    );
    fullCanvas.width = canvasWidth;
    fullCanvas.height = canvasHeight;

    const drawLayerWithBlur = async (
      sourceCanvas: HTMLCanvasElement,
      context: CanvasRenderingContext2D,
      blendMode: GlobalCompositeOperation,
      blurRadius: number
    ) => {
      const blurredCanvas = await createBlurredCanvas(sourceCanvas, blurRadius);
      context.globalCompositeOperation = blendMode;
      context.drawImage(blurredCanvas, 0, 0);
    };

    const drawImageLayer = (
      imageElement: HTMLImageElement,
      context: CanvasRenderingContext2D
    ) => {
      context.drawImage(
        imageElement,
        0,
        0,
        imageElement.width,
        imageElement.height
      );
    };

    if (fullContext) {
      drawImageLayer(usersPhoto, fullContext);
      await drawLayerWithBlur(canvas3, fullContext, "soft-light", 10);
      await drawLayerWithBlur(canvas3a, fullContext, "soft-light", 10);
    } else {
      setIsLoading(false); // Hide preloader in case of error
      return;
    }

    const croppedCanvas = document.createElement("canvas");
    const croppedContext = croppedCanvas.getContext("2d");

    croppedCanvas.width = boundingRect.width;
    croppedCanvas.height = boundingRect.height;

    const scaleX = croppedCanvas.width / fullCanvas.width;
    const scaleY = croppedCanvas.height / fullCanvas.height;
    const scale = Math.max(scaleX, scaleY);

    const offsetX = (croppedCanvas.width - fullCanvas.width * scale) / 2;
    const offsetY = (croppedCanvas.height - fullCanvas.height * scale) / 2;

    croppedContext?.drawImage(
      fullCanvas,
      0,
      0,
      fullCanvas.width,
      fullCanvas.height,
      offsetX,
      offsetY,
      fullCanvas.width * scale,
      fullCanvas.height * scale
    );

    const img = croppedCanvas.toDataURL("image/png");
    const mergedImage = document.getElementById(
      "mergedImage"
    ) as HTMLImageElement;
    mergedImage.src = img;

    setIsLoading(false); // Hide preloader once everything is done
    mergeVCanvasesAndDisplay(); // Assuming this is a synchronous function
  };

  const mergeVCanvasesAndDisplay = () => {
    const downloadContainer = document.getElementById("download-container");
    if (downloadContainer) {
      downloadContainer.style.display = "flex";
    }
  };

  useEffect(() => {
    const sepIcon = document.getElementById("sep-icon");
    sepIcon?.addEventListener("click", handleSepIconClick);

    if (document.getElementById("smart-photo")?.style.display === "block") {
      (document.getElementById("sliderP") as HTMLInputElement).value = "375";
    }

    const phoIcon = document.getElementById("pho-icon");
    if (phoIcon) {
      phoIcon.addEventListener("click", () => {
        const smartWebcam = document.getElementById("smart-webcam");
        const smartPhoto = document.getElementById("smart-photo");

        if (smartWebcam?.style.display === "flex") {
          if (isMobile()) {
            smartWebcam.style.translate = "0px 0px";
            captureScreenshot();
            smartWebcam.style.translate = "-15% 50px";
          } else {
            captureScreenshot();
          }
        } else if (smartPhoto?.style.display === "block") {
          capturePhotoScreenshot();
        }
      });
    }

    return () => {
      sepIcon?.removeEventListener("click", handleSepIconClick);
    };
  });

  return (
    <>
      {isLoading ? <Preloader /> : null}
      <div id="ui-btns">
        <input
          style={{
            width: "225px",
            display: "none",
            position: "absolute",
            zIndex: "100",
          }}
          type="range"
          min="87"
          max="455"
          id="sliderV"
        />
        <input
          style={{
            width: "225px",
            display: "none",
            position: "absolute",
            zIndex: "100",
          }}
          type="range"
          min="0"
          max="375"
          onChange={() => {}}
          id="sliderP"
        />
        <div id="pho-icon">
          <img
            src="/img/photo.svg"
            width="20"
            height="20"
            alt="Take a photo!"
          />
        </div>
        <br />
        <div id="sep-icon">
          <img
            src="/img/separator.svg"
            width="20"
            height="20"
            alt="Separator Icon"
          />
        </div>
      </div>
    </>
  );
};

export default UiButtons;
