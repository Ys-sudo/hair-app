import React from "react";
import { Dye } from "../../types"; // Import the Dye interface

interface ShopLinkProps {
  dye: Dye | null;
}

const ShopLink: React.FC<ShopLinkProps> = ({ dye }) => {
  return dye ? (
    <a
      id="shop-link"
      target="_blank"
      rel="noopener noreferrer"
      href={dye.shop_link}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <span id="dye-col" style={{ backgroundColor: dye.color }}></span>
          <p id="dye-name">{dye.name}</p>
        </div>
        <p id="s-name">{dye.name}</p>
      </div>
      <img id="dye-img" src={dye.image} width="50" height="50" alt="Dye" />
    </a>
  ) : null;
};

export default ShopLink;
