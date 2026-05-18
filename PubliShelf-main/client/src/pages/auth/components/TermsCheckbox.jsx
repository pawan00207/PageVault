import { Link } from "react-router-dom";

export const TermsCheckbox = ({ name='termsAccepted', register, rules, error, onBlurTrigger }) => {
  return (
    <div className="flex items-center relative">
      <input
        id={name}
        type="checkbox"
        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
        {...register(name, rules)}
        onBlur={() => onBlurTrigger && onBlurTrigger(name)}
      />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
        I agree to the{' '}
        <Link to="#" className="text-purple-600 hover:text-purple-500">Terms of Service</Link>
        and{' '}
        <Link to="#" className="text-purple-600 hover:text-purple-500">Privacy Policy</Link>
      </label>
      {error && <p className="absolute -bottom-4 inset-x-0 text-red-500 text-xs">{error.message}</p>}
    </div>
  );
};

export default TermsCheckbox;
