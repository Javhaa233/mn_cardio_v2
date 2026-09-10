import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import defaultImage from "assets/img/default-avatar.png";

export default function PictureUpload() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(defaultImage);

  const handleImageChange = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    let newFile = e.target.files[0];
    reader.onloadend = () => {
      setFile(newFile);
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(newFile);
  };

  return (
    <div className="picture-container">
      <div className="picture">
        <img src={imagePreviewUrl} className="picture-src" alt="..." />
        <input type="file" onChange={(e) => handleImageChange(e)} />
      </div>
      <h6 className="description">{t("Choose Picture")}</h6>
    </div>
  );
}
