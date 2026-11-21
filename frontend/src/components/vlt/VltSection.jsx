/**
 * VltSection — standard public-page section wrapper
 * Provides consistent max-width, padding, and optional top border.
 * Usage: <VltSection border><h2>...</h2></VltSection>
 */
import React from 'react';

export const VltSection = ({
  children,
  className = '',
  border = false,
  dark = false,
  id,
  as: Tag = 'section',
  ...props
}) => {
  const base = [
    dark ? 'theme-dark bg-black text-white' : 'bg-white text-black',
    'py-24 px-6 md:px-12',
    border ? 'border-t border-black/10' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag id={id} className={base} {...props}>
      <div className="max-w-[1600px] mx-auto">
        {children}
      </div>
    </Tag>
  );
};

export default VltSection;
