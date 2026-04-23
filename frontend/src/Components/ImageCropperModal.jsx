import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { LuCheck, LuX } from 'react-icons/lu';
import './ImageCropperModal.css';

const ImageCropperModal = ({ imageSrc, onCropDone, onCropCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropDone(croppedImage);
    } catch (e) {
      console.error(e);
      onCropCancel();
    }
  };

  return (
    <div className="cropper-modal-overlay">
      <div className="cropper-modal">
        <div className="cropper-header">
          <h3>Edit Profile Photo</h3>
          <button className="cropper-close-btn" onClick={onCropCancel}>
            <LuX size={20} />
          </button>
        </div>
        
        <div className="cropper-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Strict 1:1 Aspect Ratio for CV Photos
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="round" // Round looks more professional during crop
            showGrid={false}
          />
        </div>
        
        <div className="cropper-controls">
          <label>Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="zoom-slider"
          />
        </div>
        
        <div className="cropper-footer">
          <button className="cropper-cancel-btn" onClick={onCropCancel}>
            Cancel
          </button>
          <button className="cropper-save-btn" onClick={handleSave}>
            <LuCheck size={16} /> Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
