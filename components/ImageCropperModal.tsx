"use client";
import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropUtils';

interface ImageCropperModalProps {
  image: string;
  aspect: number;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
  title?: string;
}

export default function ImageCropperModal({ 
  image, 
  aspect, 
  onCropComplete, 
  onClose,
  title = "Crop Image"
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleShowCroppedImage = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        if (croppedImage) {
          onCropComplete(croppedImage);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '700px',
        height: '80vh',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#b07d62' }}>
            {title}
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: '#999'
            }}
          >
            &times;
          </button>
        </div>

        <div style={{ 
          position: 'relative', 
          flex: 1, 
          background: '#333' 
        }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropAreaComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div style={{ 
          padding: '1.5rem',
          background: '#f9f9f9',
          borderTop: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d5a4d' }}>ZOOM</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#b07d62' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.6rem 1.4rem',
                border: '1.5px solid #d1c1b1',
                borderRadius: '10px',
                background: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleShowCroppedImage}
              style={{
                padding: '0.6rem 1.8rem',
                border: 'none',
                borderRadius: '10px',
                background: '#b07d62',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(176, 125, 98, 0.25)'
              }}
            >
              Done Cropping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
