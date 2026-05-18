export const NameFields = ({ register, trigger, errors, firstNameRules, lastNameRules }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700">First Name</label>
      <input
        type="text"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-purple-500"
        {...register('firstname', firstNameRules)}
        onBlur={() => trigger('firstname')}
      />
      {errors.firstname && <p className="absolute -bottom-4 inset-x-0 text-red-500 text-[11px]">{errors.firstname.message}</p>}
    </div>
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700">Last Name</label>
      <input
        type="text"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-purple-500"
        {...register('lastname', lastNameRules)}
        onBlur={() => trigger('lastname')}
      />
      {errors.lastname && <p className="absolute -bottom-4 inset-x-0 text-red-500 text-[11px]">{errors.lastname.message}</p>}
    </div>
  </div>
);

export default NameFields;
