import React, { useEffect, useState, useCallback } from "react";
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

  // Fetch data from Firebase only once when the component mounts
  useEffect(() => {
    const fetchData = () => {
      const database = getDatabase(app);
      const dbRef = ref(database, "/");
      onValue(dbRef, (snapshot) => {
        const data: DyeData = snapshot.val();
        if (data && data.series.length > 0) {
          setSeriesList(data.series);
          setSelectedSeriesIndex(0);
          const initialDye = data.series[0].dyes[0];
          if (initialDye) {
            setSelectedDye(initialDye);
            updateColor(initialDye.color, initialDye.opacity);
          }
        }
      });
    };
    fetchData();
  }, []);

  // Initialize Swiper only once when the component mounts
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

    // Cleanup event listeners on unmount
    return () => {
      swiper.destroy();
    };
  }, []);

  // Update Swiper slides when seriesList or selectedSeriesIndex changes
  useEffect(() => {
    if (swiperInstance && seriesList.length > 0) {
      const updateSwiperSlides = (seriesIndex: number) => {
        const selectedSeries = seriesList[seriesIndex];
        const swiperWrapper = document.querySelector(".swiper-wrapper");

        if (swiperWrapper) {
          swiperWrapper.innerHTML = "";
          swiperWrapper.innerHTML = selectedSeries.dyes
            .map(
              (dye) =>
                `<div class="swiper-slide">
                  <div onclick='window.setDye(${seriesIndex}, "${dye.name}")' 
                       style="background-color: ${dye.color};" 
                       class="color-btn"></div>
                 </div>`
            )
            .join("");

          swiperInstance.update();
          if (!selectedSeries.dyes.includes(selectedDye!)) {
            setSelectedDye(selectedSeries.dyes[0]);
            const initialDye = selectedSeries.dyes[0];
            updateColor(initialDye.color, initialDye.opacity);
          }
        }
      };

      updateSwiperSlides(selectedSeriesIndex);
    }
  }, [seriesList, selectedSeriesIndex]);

  // Handle dye selection and update the color
  const handleDyeSelection = useCallback(
    (seriesIndex: number, dyeName: string) => {
      const selectedSeries = seriesList[seriesIndex];
      const selectedDye = selectedSeries?.dyes.find(
        (dye) => dye.name === dyeName
      );

      if (selectedDye) {
        setSelectedDye(selectedDye);
        updateColor(selectedDye.color, selectedDye.opacity);
      }
    },
    [selectedSeriesIndex, updateColor]
  );

  // Update window.setDye whenever seriesList or handleDyeSelection changes
  useEffect(() => {
    window.setDye = handleDyeSelection;
  }, [handleDyeSelection]);

  const handleSeriesChange = (index: number) => {
    setSelectedSeriesIndex(index);
    closeDropdown();
  };

  const toggleDropdown = () => {
    const optionsContainer = document.querySelector(".options-container");
    optionsContainer?.classList.toggle("open");
    document.querySelector(".selected-option")?.classList.toggle("hide");
    if (optionsContainer?.classList.contains("open")) {
      document.addEventListener("click", closeDropdownListener);
    } else {
      document.removeEventListener("click", closeDropdownListener);
    }
  };

  const closeDropdownListener = (event: MouseEvent) => {
    const seriesSelect = document.querySelector("#series-select");
    if (!seriesSelect?.contains(event.target as Node)) {
      closeDropdown();
    }
  };

  const closeDropdown = () => {
    document.querySelector(".options-container")?.classList.remove("open");
    document.querySelector(".selected-option")?.classList.remove("hide");
    document.removeEventListener("click", closeDropdownListener);
  };

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
                      onClick={() => handleDyeSelection(index, dye.name)} // Handle dye selection
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
