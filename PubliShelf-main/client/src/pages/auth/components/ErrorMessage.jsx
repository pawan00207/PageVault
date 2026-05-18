import React from 'react';

// Generic error message block.
export const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return <p className="text-red-500 text-sm">{message}</p>;
};

export default ErrorMessage;
