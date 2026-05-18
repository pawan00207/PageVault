import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { forgotPassword, resendOtp, resetPassword, verifyResetOtp } from "../../../services/auth.services.js";
import { AuthHeader, TextInput, PasswordField, OtpVerificationForm, ErrorMessage } from "../components";

const passwordRules = {
  required: "New password is required.",
  minLength: { value: 3, message: "Password must be at least 3 characters long." },
};

const ForgotPassword = ({ onBackToLogin }) => {
  const { register, handleSubmit, watch, formState: { errors }, trigger, reset } = useForm({ mode: "onBlur", shouldUnregister: false });

  const [step, setStep] = useState("email");
  const [serverError, setServerError] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpValue, setOtpValue] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const resetFormRef = useRef(null);

  const newPassword = watch("newPassword") || "";

  useEffect(() => {
    if (step !== "otp" || otpCooldown <= 0) return undefined;

    const intervalId = setInterval(() => {
      setOtpCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [step, otpCooldown]);

  useEffect(() => {
    if (step !== "reset") return;

    resetFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusTimeout = setTimeout(() => {
      const passwordInput = document.getElementById("newPassword");
      passwordInput?.focus();
    }, 150);

    return () => clearTimeout(focusTimeout);
  }, [step]);

  const sendResetOtp = async (emailValue) => {
    const response = await forgotPassword({ email: emailValue });

    if (response.success) {
      setEmail(emailValue);
      setStep("otp");
      setOtpCooldown(60);
      setIsOtpVerified(false);
      setOtpValue("");
      reset({ newPassword: "", confirmPassword: "" });
      toast.success(response.message || "OTP sent to your email");
      return true;
    }

    setServerError(response.message || "Failed to send OTP");
    toast.error(response.message || "Failed to send OTP");
    return false;
  };

  const handleEmailSubmit = async (data) => {
    setServerError("");
    setIsSubmittingEmail(true);

    try {
      await sendResetOtp(data.email.trim().toLowerCase());
    } catch (error) {
      console.error("Forgot password request failed:", error);
      setServerError(error?.response?.data?.message || "Failed to send reset OTP. Please try again.");
      toast.error(error?.response?.data?.message || "Failed to send reset OTP. Please try again.");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    if (!email) return;

    setServerError("");
    setIsVerifyingOtp(true);

    try {
      const response = await verifyResetOtp({ email, otp });

      if (response.success) {
        setOtpValue(otp);
        setIsOtpVerified(true);
        setServerError("");
        setStep("reset");
        toast.success(response.message || "OTP verified successfully");
        return;
      }

      setIsOtpVerified(false);
      setOtpValue("");
      setServerError(response.message || "Invalid OTP");
      toast.error(response.message || "Invalid OTP");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setIsOtpVerified(false);
      setOtpValue("");
      setServerError(error?.response?.data?.message || "Invalid OTP. Please try again.");
      toast.error(error?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return false;

    setServerError("");
    setIsResendingOtp(true);

    try {
      const response = await resendOtp({ email, purpose: "reset_password" });

      if (response.success) {
        setOtpCooldown(60);
        setIsOtpVerified(false);
        setOtpValue("");
        setStep("otp");
        toast.success(response.message || "OTP resent successfully");
        return true;
      }

      setServerError(response.message || "Failed to resend OTP");
      toast.error(response.message || "Failed to resend OTP");
      return false;
    } catch (error) {
      console.error("Error resending OTP:", error);
      setServerError(error?.response?.data?.message || "Failed to resend OTP. Please try again.");
      toast.error(error?.response?.data?.message || "Failed to resend OTP. Please try again.");
      return false;
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleResetPassword = async (data) => {
    if (!isOtpVerified || !otpValue) {
      setServerError("Please verify the OTP before resetting your password.");
      toast.error("Please verify the OTP before resetting your password.");
      return;
    }

    setServerError("");
    setIsResettingPassword(true);

    try {
      const response = await resetPassword({
        email,
        otp: otpValue,
        newPassword: data.newPassword,
      });

      if (response.success) {
        toast.success(response.message || "Password reset successfully");
        setStep("email");
        setEmail("");
        setOtpValue("");
        setIsOtpVerified(false);
        setOtpCooldown(0);
        reset({ email: "", newPassword: "", confirmPassword: "" });
        onBackToLogin?.();
        return;
      }

      setServerError(response.message || "Failed to reset password");
      toast.error(response.message || "Failed to reset password");
    } catch (error) {
      console.error("Password reset failed:", error);
      setServerError(error?.response?.data?.message || "Failed to reset password. Please try again.");
      toast.error(error?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleBackToLogin = () => {
    setServerError("");
    setStep("email");
    setEmail("");
    setOtpValue("");
    setIsOtpVerified(false);
    setOtpCooldown(0);
    reset({ email: "", newPassword: "", confirmPassword: "" });
    onBackToLogin?.();
  };

  const handleBackToEmail = () => {
    setServerError("");
    setStep("email");
    setOtpValue("");
    setIsOtpVerified(false);
    setOtpCooldown(0);
    reset({ newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white bg-gray-50">
      <div className="max-w-md w-full">
        <AuthHeader
          title="Reset your password"
          subtitle={<button type="button" onClick={handleBackToLogin} className="font-medium text-purple-600 hover:text-purple-500">Back to login</button>}
        />

        {step === "email" ? (
          <form onSubmit={handleSubmit(handleEmailSubmit)}>
            <div className="bg-white p-8 rounded-xl shadow-lg space-y-6 animate-fade-in">
              <TextInput
                label="Registered email address"
                name="email"
                type="email"
                placeholder="you@publishelf.com"
                iconClass="fas fa-envelope"
                register={register}
                rules={{
                  required: "Email is required.",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email address." },
                  validate: { noUpper: (value) => value === value.toLowerCase() || "Uppercase letters are not allowed." }
                }}
                error={errors.email}
                onBlurTrigger={trigger}
              />

              <ErrorMessage message={serverError} />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-1/2 flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  Back to login
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingEmail}
                  className={`w-1/2 flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white ${isSubmittingEmail ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300`}
                >
                  {isSubmittingEmail ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <OtpVerificationForm
              email={email}
              title="Verify reset code"
              description="Enter the 6-digit code sent to your registered email."
              contextLabel="password reset"
              cooldownSeconds={otpCooldown}
              isVerifying={isVerifyingOtp}
              isResending={isResendingOtp}
              error={serverError}
              onBack={handleBackToEmail}
              onConfirm={handleVerifyOtp}
              onResend={handleResendOtp}
            />

            {step === "reset" && isOtpVerified ? (
              <form onSubmit={handleSubmit(handleResetPassword)}>
                <div ref={resetFormRef} className="bg-white p-8 rounded-xl shadow-lg space-y-6 animate-fade-in border border-green-100">
                  <p className="text-sm font-medium text-green-700">OTP verified. Enter your new password.</p>

                  <PasswordField
                    name="newPassword"
                    label="New password"
                    register={register}
                    rules={passwordRules}
                    error={errors.newPassword}
                    onBlurTrigger={() => trigger("confirmPassword")}
                  />

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-lock text-gray-400"></i>
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        {...register("confirmPassword", {
                          required: "Please confirm your password.",
                          validate: (value) => value === newPassword || "Passwords do not match.",
                        })}
                        onBlur={() => trigger("confirmPassword")}
                      />
                      {errors.confirmPassword && <p className="absolute -bottom-4 inset-x-0 text-red-500 text-xs">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>

                  <ErrorMessage message={serverError} />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="w-1/2 flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={isResettingPassword}
                      className={`w-1/2 flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white ${isResettingPassword ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300`}
                    >
                      {isResettingPassword ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 text-center text-sm text-gray-600">
                Verify the OTP first to unlock the new password fields.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;