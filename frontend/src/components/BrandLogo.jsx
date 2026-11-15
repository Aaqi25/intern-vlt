import React from 'react';
import logoImage from '../assets/thozhill-removebg.webp';

export default function BrandLogo({
  className = '',
  imageClassName = 'h-8 w-auto',
  caption,
}) {
  return (
    <span className={`thozhil-brand-lockup ${className}`}>
      <img
        className={`thozhil-brand-logo ${imageClassName}`}
        src={logoImage}
        alt="THOZHIL"
      />
      {caption && <span className="thozhil-brand-caption">{caption}</span>}
    </span>
  );
}
