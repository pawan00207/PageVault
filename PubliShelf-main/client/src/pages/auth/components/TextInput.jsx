export const TextInput = ({ label, name, type = 'text', placeholder, iconClass, register, rules, error, onBlurTrigger }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700" htmlFor={name}>{label}</label>}
      <div className="mt-1 relative">
        {iconClass && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`${iconClass} text-gray-400`}></i>
          </div>
        )}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          className={`appearance-none block w-full ${iconClass ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg focus:ring-2 focus:ring-purple-500`}
          {...register(name, rules)}
          onBlur={() => onBlurTrigger && onBlurTrigger(name)}
        />
        {error && <p className="absolute -bottom-4 inset-x-0 text-red-500 text-xs">{error.message}</p>}
      </div>
    </div>
  );
};

export default TextInput;
