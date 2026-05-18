export const ConfirmPasswordField = ({ register, trigger, errors, passwordValue, name='confirmPassword' }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
    <div className="mt-1 relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="fas fa-lock text-gray-400"></i>
      </div>
      <input
        type="password"
        placeholder="••••••••"
        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg focus:ring-2 focus:ring-purple-500"
        {...register(name, {
          required: 'Please confirm your password.',
          validate: v => v === passwordValue || 'Passwords do not match.'
        })}
        onBlur={() => {
          trigger(name);
          trigger('password');
        }}
      />
      {errors[name] && <p className="absolute -bottom-4 inset-x-0 text-red-500 text-xs">{errors[name].message}</p>}
    </div>
  </div>
);

export default ConfirmPasswordField;
