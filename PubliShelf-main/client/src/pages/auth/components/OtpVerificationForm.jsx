import { useEffect, useRef, useState } from "react";

const OTP_LENGTH = 6;

const createEmptyOtp = () => Array.from({ length: OTP_LENGTH }, () => "");

export const OtpVerificationForm = ({
  email,
  title = "Verify your email",
  description = "Enter the 6-digit code sent to your inbox.",
  contextLabel = "signup verification",
  cooldownSeconds = 60,
  isVerifying = false,
  isResending = false,
  error = "",
  onBack,
  onConfirm,
  onResend,
}) => {
  const [otpDigits, setOtpDigits] = useState(createEmptyOtp());
  const inputRefs = useRef([]);
  const lastAutoSubmittedRef = useRef("");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const otp = otpDigits.join("");
    const isComplete = otpDigits.every((digit) => digit !== "");

    if (isComplete && otp !== lastAutoSubmittedRef.current) {
      lastAutoSubmittedRef.current = otp;
      onConfirm?.(otp);
    }

    if (!isComplete) {
      lastAutoSubmittedRef.current = "";
    }
  }, [otpDigits, onConfirm]);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select?.();
  };

  const updateDigit = (index, value) => {
    setOtpDigits((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "");

    if (!value) {
      updateDigit(index, "");
      return;
    }

    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH - index).split("");
      setOtpDigits((current) => {
        const next = [...current];
        digits.forEach((digit, digitIndex) => {
          next[index + digitIndex] = digit;
        });
        return next;
      });
      const nextFocusIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      focusInput(nextFocusIndex);
      return;
    }

    updateDigit(index, value);
    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (otpDigits[index]) {
        updateDigit(index, "");
        return;
      }

      if (index > 0) {
        updateDigit(index - 1, "");
        focusInput(index - 1);
      }
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pastedDigits) return;

    setOtpDigits((current) => {
      const next = [...current];
      pastedDigits.split("").forEach((digit, index) => {
        next[index] = digit;
      });
      return next;
    });

    focusInput(Math.min(pastedDigits.length, OTP_LENGTH) - 1);
  };

  const otpValue = otpDigits.join("");
  const isComplete = otpDigits.every((digit) => digit !== "");

  const handleConfirmClick = () => {
    if (!isComplete || isVerifying) return;
    onConfirm?.(otpValue);
  };

  const handleResendClick = async () => {
    if (cooldownSeconds > 0 || isResending) return;
    const resendSucceeded = await onResend?.();
    if (resendSucceeded === false) return;

    setOtpDigits(createEmptyOtp());
    lastAutoSubmittedRef.current = "";
    focusInput(0);
  };

  const timerLabel = cooldownSeconds > 0 ? `Resend available in ${cooldownSeconds}s` : "You can resend the code now";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 animate-fade-in">
      <div className="space-y-3 text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-500">{contextLabel}</p>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-sm font-medium text-purple-700 break-all">{email}</p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl border border-gray-300 text-center text-xl font-semibold text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
            aria-label={`OTP digit ${index + 1}`}
            disabled={isVerifying}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleConfirmClick}
          disabled={!isComplete || isVerifying}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white transition-all duration-300 ${
            !isComplete || isVerifying ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {isVerifying ? "Verifying..." : "Confirm OTP"}
        </button>

        <button
          type="button"
          onClick={handleResendClick}
          disabled={cooldownSeconds > 0 || isResending}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium border transition-all duration-300 ${
            cooldownSeconds > 0 || isResending
              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              : "border-purple-200 text-purple-700 hover:bg-purple-50"
          }`}
        >
          {isResending ? "Sending..." : "Resend OTP"}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isVerifying || isResending}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-300"
        >
          Back to signup
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
        <p>{timerLabel}</p>
        <p>Purpose: {contextLabel}</p>
      </div>
    </div>
  );
};

export default OtpVerificationForm;