/**
 * PageGallery Component
 * Display page preview gallery with image carousel
 * 
 * @version 1.0.0
 * @author BankIM Development Team
 * @since 2024-12-17
 */

import React, { useState } from 'react';
import './PageGallery.css';

interface PageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

const PageGallery: React.FC<PageGalleryProps> = ({
  images,
  title,
  className = ''
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <div className={`page-gallery ${className}`}>
      <div className="gallery-header">
        <h2 className="gallery-title">{title}</h2>
      </div>
      
      <div className="gallery-main">
        <div className="main-image-container">
          <div className="main-image">
            <img 
              src={images[selectedImageIndex]} 
              alt={`Page preview ${selectedImageIndex + 1}`}
              className="preview-image"
            />
          </div>
        </div>
      </div>
      
      <div className="gallery-carousel">
        <button 
          className="carousel-button prev"
          onClick={handlePrevious}
          disabled={images.length <= 1}
          aria-label="Previous image"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="thumbnail-container">
          {images.map((image, index) => (
            <div
              key={index}
              className={`thumbnail ${index === selectedImageIndex ? 'selected' : ''}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`}
                className="thumbnail-image"
              />
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-button next"
          onClick={handleNext}
          disabled={images.length <= 1}
          aria-label="Next image"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PageGallery;