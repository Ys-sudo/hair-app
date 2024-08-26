import React from "react";

const UiButtons: React.FC = () => {
  return (
    <div id="ui-btns">
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
