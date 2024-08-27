import React, { useEffect } from "react";

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

  const isMobile = () => window.innerWidth <= 768;

  // Video-specific functions
  const beforeAfterSegmentV = () => {
    const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
    const canvas1a = document.getElementById("canvas1a") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
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
    const canvas = document.getElementById("webcam") as HTMLCanvasElement;
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

  useEffect(() => {
    const sepIcon = document.getElementById("sep-icon");
    sepIcon?.addEventListener("click", handleSepIconClick);

    if (document.getElementById("smart-photo")?.style.display === "block") {
      (document.getElementById("sliderP") as HTMLInputElement).value = "375";
    }

    return () => {
      sepIcon?.removeEventListener("click", handleSepIconClick);
    };
  }, []);

  return (
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
        <img src="/img/photo.svg" width="20" height="20" alt="Photo Icon" />
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
  );
};

export default UiButtons;
