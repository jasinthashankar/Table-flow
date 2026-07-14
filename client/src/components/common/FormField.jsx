import React from 'react';

const FormField = React.forwardRef(({
  label,
  name,
  type = 'text',
  error,
  placeholder,
  className = '',
  ...props
}, ref) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label htmlFor={name} className="tf-label">
        {label}
      </label>
    )}

    <input
      ref={ref}
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : undefined}
      className={error ? '!border-[#ff786c] !bg-[#ff786c]/[.06]' : ''}
      {...props}
    />

    {error && (
      <span
        id={`${name}-error`}
        className="mt-1.5 block text-[10px] font-bold text-[#ff9a91]"
      >
        {error.message}
      </span>
    )}
  </div>
));

FormField.displayName = 'FormField';

export default FormField;
