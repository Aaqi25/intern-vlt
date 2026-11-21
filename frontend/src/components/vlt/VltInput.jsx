/**
 * VltInput — single-line text input matching VLT design language.
 * For use in public-page forms (login, job portal auth).
 * Dashboard forms keep their existing UI components.
 *
 * Usage:
 *   <VltInput type="email" placeholder="name@domain.com" icon={<Mail />} {...register('email')} />
 */
import React, { forwardRef } from 'react';

export const VltInput = forwardRef(({
  type = 'text',
  placeholder,
  icon,
  error,
  label,
  id,
  className = '',
  ...props
}, ref) => {
  const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs uppercase tracking-[0.14em] font-mono font-bold text-neutral-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          className={[
            'w-full py-3 text-sm font-sans border bg-white text-black',
            'placeholder:text-neutral-400 focus:outline-none focus:border-black',
            'transition-colors',
            icon ? 'pl-10 pr-4' : 'px-4',
            error ? 'border-rose-400' : 'border-neutral-300',
          ].join(' ')}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-600 font-mono" role="alert">
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
});

VltInput.displayName = 'VltInput';
export default VltInput;
