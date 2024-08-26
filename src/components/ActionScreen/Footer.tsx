import React, { useEffect, useState } from "react";
import Swiper from "swiper";
import "swiper/css";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../firebase";
import ShopLink from "./ShopLink";
import { Navigation, Scrollbar, Mousewheel, FreeMode } from "swiper/modules";
import { Dye, Series, DyeData } from "../../types";

declare global {
  interface Window {
    setDye: (seriesIndex: number, dyeName: string) => void;
  }
}

Swiper.use([Navigation, Scrollbar, Mousewheel, FreeMode]);

interface FooterProps {
  updateColor: (color: string, opacity: number) => void;
}

const Footer: React.FC<FooterProps> = ({ updateColor }) => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState<number>(0);
  const [selectedDye, setSelectedDye] = useState<Dye | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);

  useEffect(() => {
    const database = getDatabase(app);
    const dbRef = ref(database, "/");
    onValue(dbRef, (snapshot) => {
      const data: DyeData = snapshot.val();
      setSeriesList(data.series);
      setSelectedSeriesIndex(0);
      if (data.series.length > 0 && data.series[0].dyes.length > 0) {
        setSelectedDye(data.series[0].dyes[0]); // Initial dye selection
        updateColor(
          data.series[0].dyes[0].color,
          data.series[0].dyes[0].opacity
        ); // Set initial color
      }
    });
  }, []);

  useEffect(() => {
    if (swiperInstance && seriesList.length > 0) {
      updateSwiperSlides(selectedSeriesIndex); // Update slides when series changes
    }
  }, [swiperInstance, seriesList, selectedSeriesIndex]);

  useEffect(() => {
    if (selectedDye) {
      updateColor(selectedDye.color, selectedDye.opacity); // Update color when dye changes
    }
  }, [selectedDye]);

  const updateSwiperSlides = (seriesIndex: number) => {
    if (!swiperInstance || seriesList.length === 0) return;
    const selectedSeries = seriesList[seriesIndex];

    const swiperWrapper = document.querySelector(".swiper-wrapper");
    if (swiperWrapper) {
      swiperWrapper.innerHTML = "";

      selectedSeries.dyes.forEach((dye: Dye) => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.innerHTML = `<div onclick='window.setDye(${seriesIndex}, "${dye.name}")' style="background-color: ${dye.color};" class="color-btn"></div>`;
        swiperWrapper.appendChild(slide);
      });

      swiperInstance.update();
      // Ensure the selected dye is not reset unless necessary
      if (!selectedDye || !selectedSeries.dyes.includes(selectedDye)) {
        setSelectedDye(selectedSeries.dyes[0]);
      }
    }
  };

  const handleDyeClick = (dye: Dye) => {
    setSelectedDye(dye);
  };

  const handleSeriesChange = (index: number) => {
    setSelectedSeriesIndex(index);
    closeDropdown();
  };

  const toggleDropdown = () => {
    const optionsContainer = document.querySelector(".options-container");
    if (optionsContainer?.classList.contains("open")) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const openDropdown = () => {
    const selectedOption = document.querySelector(".selected-option");
    const optionsContainer = document.querySelector(".options-container");
    optionsContainer?.classList.add("open");
    selectedOption?.classList.add("hide");
    document.addEventListener("click", closeDropdownListener);
  };

  const closeDropdown = () => {
    const selectedOption = document.querySelector(".selected-option");
    const optionsContainer = document.querySelector(".options-container");
    optionsContainer?.classList.remove("open");
    selectedOption?.classList.remove("hide");
    document.removeEventListener("click", closeDropdownListener);
  };

  const closeDropdownListener = (event: MouseEvent) => {
    const seriesSelect = document.querySelector("#series-select");
    if (!seriesSelect?.contains(event.target as Node)) {
      closeDropdown();
    }
  };

  useEffect(() => {
    const swiper = new Swiper(".swiper", {
      freeMode: true,
      mousewheel: {
        enabled: true,
        forceToAxis: true,
      },
      keyboard: {
        enabled: true,
      },
      grabCursor: true,
      slidesPerView: 4,
      spaceBetween: 0,
      scrollbar: {
        el: ".swiper-scrollbar",
        draggable: true,
      },
    });

    setSwiperInstance(swiper);

    window.setDye = (seriesIndex: number, dyeName: string) => {
      if (seriesList.length === 0 || !seriesList[seriesIndex]) {
        console.error(`Series with index ${seriesIndex} does not exist.`);
        return;
      }

      const selectedSeries = seriesList[seriesIndex];
      const selectedDye = selectedSeries.dyes.find(
        (dye) => dye.name === dyeName
      );

      if (!selectedDye) {
        console.error(
          `Dye with name ${dyeName} does not exist in the selected series.`
        );
        return;
      }

      setSelectedDye(selectedDye);
      updateColor(selectedDye.color, selectedDye.opacity);
    };

    return () => {
      document.removeEventListener("click", closeDropdownListener);
    };
  }, [seriesList, updateColor]);

  return (
    <div className="modal-footer" id="footer" style={{ display: "contents" }}>
      <div className="swiper">
        <div className="swiper-wrapper">
          {/* Swiper slides will be dynamically added */}
        </div>
        <div className="swiper-scrollbar"></div>
      </div>
      <div className="custom-select" id="series-select">
        <div className="selected-option" onClick={toggleDropdown}>
          <img
            src="../img/palettes.svg"
            width="15"
            height="15"
            style={{ marginRight: "15px" }}
            alt="Palettes Icon"
          />
          <span id="selected-text">
            {seriesList.length > 0
              ? seriesList[selectedSeriesIndex].name
              : "Select a series"}
          </span>
        </div>
        <div className="options-container">
          {seriesList.map((series, index) => (
            <div
              key={index}
              className="option"
              data-index={index}
              onClick={() => handleSeriesChange(index)}
            >
              <img
                src="../img/palettes.svg"
                width="15"
                height="15"
                alt="Palettes Icon"
              />
              <div>
                <span style={{ marginRight: "10px" }}>{series.name}</span>
                <div className="color-samples-container">
                  {series.dyes.map((dye, dyeIndex) => (
                    <div
                      key={dyeIndex}
                      className="color-sample"
                      style={{ backgroundColor: dye.color }}
                      title={dye.name}
                      onClick={() => handleDyeClick(dye)} // Call handleDyeClick on color sample click
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ShopLink dye={selectedDye} />
    </div>
  );
};

export default Footer;
