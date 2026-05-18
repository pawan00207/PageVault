import React, { useState } from 'react';

// Password input with show/hide toggle.
// Props: name, label, placeholder, register, rules, error, onBlurTrigger, includeStrength, strengthContent
export const PasswordField = ({ name='password', label='Password', placeholder='••••••••', register, rules, error, onBlurTrigger, includeStrength=false, strengthContent }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700" htmlFor={name}>{label}</label>
      <div className="mt-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fas fa-lock text-gray-400"></i>
        </div>
        <input
          id={name}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          {...register(name, rules)}
          onBlur={() => onBlurTrigger && onBlurTrigger(name)}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'} text-gray-400`}></i>
        </button>
        {error && <p className="absolute -bottom-4 inset-x-0 text-red-500 text-xs">{error.message}</p>}
      </div>
      {includeStrength && strengthContent}
    </div>
  );
};

export default PasswordField;
