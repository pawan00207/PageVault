export const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 3) score++;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const getStrengthInfo = (s) => {
    switch (s) {
      case 0: return { label: 'Too Weak', color: 'bg-gray-300' };
      case 1: return { label: 'Very Weak', color: 'bg-red-400' };
      case 2: return { label: 'Weak', color: 'bg-orange-400' };
      case 3: return { label: 'Moderate', color: 'bg-yellow-400' };
      case 4: return { label: 'Strong', color: 'bg-green-500' };
      case 5: return { label: 'Very Strong', color: 'bg-purple-600' };
      default: return { label: 'Too Weak', color: 'bg-gray-300' };
    }
  };
  const info = getStrengthInfo(score);
  const criteria = [
    { ok: password.length >= 3, hint: 'At least 3 characters' },
    { ok: /[A-Z]/.test(password), hint: 'Add an uppercase letter (A-Z)' },
    { ok: /[0-9]/.test(password), hint: 'Add a number (0-9)' },
    { ok: /[^A-Za-z0-9]/.test(password), hint: 'Add a special character (!@#$%)' },
    { ok: password.length >= 6, hint: 'At least 6 characters (stronger)' },
  ];
  const nextReq = criteria.find(c => !c.ok);
  return (
    <div className="mt-2 relative">
      <div className="h-2 w-full bg-gray-200 rounded">
        <div className={`h-full rounded transition-all duration-300 ${info.color}`} style={{ width: `${(score/5)*100}%` }}></div>
      </div>
      <div className="absolute top-[2px] inset-x-0 flex flex-row-reverse justify-between items-center">
        <p className="text-xs mt-1 text-purple-600 font-medium">{info.label}</p>
        <div className="h-5 mt-2 overflow-hidden relative w-[80%]">
          {nextReq && (
            <div className="absolute left-0 text-xs whitespace-nowrap animate-[slideIn_0.45s_ease-out]">
              <p className="text-gray-600">{nextReq.hint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
