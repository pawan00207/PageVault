//client/src/pages/auth/signup/buyer/BuyerSignup.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { signupUser, verifyOtp, resendOtp, googleAuth } from "../../../../services/auth.services.js";
import { AuthHeader, TextInput, PasswordField, PasswordStrengthMeter, TermsCheckbox, NameFields, ConfirmPasswordField, OtpVerificationForm, GoogleAuthButton } from '../../components';
import { applyAuthSession } from "../../../../utils/authSession.util.js";

const BuyerSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({ mode: 'onBlur', shouldUnregister: false });
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  const passwordValue = watch('password') || '';

  useEffect(() => {
    if (!showOtpStep || otpCooldown <= 0) return undefined;

    const intervalId = setInterval(() => {
      setOtpCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [showOtpStep, otpCooldown]);

  const handleAuthenticatedSession = (userData) => {
    applyAuthSession(dispatch, userData);
    navigate(`/${userData.role}/dashboard`);
  };

  const onSubmit = async (data) => {
    setServerError('');
    const { firstname, lastname, email, password } = data;
    setIsLoading(true);
    try {
      const response = await signupUser({
        role: 'buyer',
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      if (response.success) {
        setOtpEmail(email.trim().toLowerCase());
        setShowOtpStep(true);
        setOtpCooldown(60);
        toast.success(response.message || 'OTP sent to your email');
      } else {
        setServerError(response.message || 'An unexpected error occurred.');
        toast.error(response.message || 'An unexpected error occurred.');
      }
    } catch (e) {
      console.error('Error during signup:', e);
      setServerError('An error occurred. Please try again later.');
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    if (!otpEmail) return;

    setServerError('');
    setIsVerifyingOtp(true);

    try {
      const response = await verifyOtp({
        email: otpEmail,
        otp,
        role: 'buyer',
        purpose: 'signup',
      });

      if (response.success) {
        toast.success(response.message || 'Email verified successfully');
        navigate('/auth/login');
        return;
      }

      setServerError(response.message || 'Failed to verify OTP');
      toast.error(response.message || 'Failed to verify OTP');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setServerError('Failed to verify OTP. Please try again.');
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpEmail) return;

    setServerError('');
    setIsResendingOtp(true);

    try {
      const response = await resendOtp({
        email: otpEmail,
        role: 'buyer',
        purpose: 'signup',
      });

      if (response.success) {
        setOtpCooldown(60);
        toast.success(response.message || 'OTP resent successfully');
        return true;
      }

      setServerError(response.message || 'Failed to resend OTP');
      toast.error(response.message || 'Failed to resend OTP');
      return false;
    } catch (error) {
      console.error('Error resending OTP:', error);
      setServerError('Failed to resend OTP. Please try again.');
      toast.error('Failed to resend OTP. Please try again.');
      return false;
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleGoogleSignIn = async (credential) => {
    setServerError('');
    setIsGoogleLoading(true);

    try {
      const response = await googleAuth({ credential, role: 'buyer' });

      if (response.success) {
        const userData = response.data?.user;

        if (response.data?.authenticated && userData) {
          handleAuthenticatedSession(userData);
          toast.success(response.message || 'Google sign-in successful');
        } else {
          const message = response.message || 'Google account created, but approval is pending.';
          setServerError(message);
          toast.info(message);
          navigate('/auth/login');
        }

        return;
      }

      const message = response.message || 'Google sign-in failed.';
      setServerError(message);
      toast.error(message);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      const message = error?.response?.data?.message || 'Google sign-in failed. Please try again.';
      setServerError(message);
      toast.error(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setServerError('');
    setShowOtpStep(false);
    setOtpEmail('');
    setOtpCooldown(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-md w-full">
        <AuthHeader
          title="Create Buyer Account"
          subtitle={<span>Already have an account? <Link to="/auth/login" className="font-medium text-purple-600 hover:text-purple-500">Sign in</Link></span>}
        />

        {!showOtpStep ? (
          <form id="signupForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white p-8 rounded-xl shadow-lg space-y-6 animate-fade-in">
              <NameFields
                register={register}
                trigger={trigger}
                errors={errors}
                firstNameRules={{
                  required: 'First name is required.',
                  validate: {
                    noEmpty: v => v.trim() !== '' || 'First name cannot be empty.',
                    alphabetsOnly: v => /^[A-Za-z\s]+$/.test(v) || 'Only alphabets and spaces allowed.',
                  }
                }}
                lastNameRules={{
                  required: 'Last name is required.',
                  validate: {
                    noEmpty: v => v.trim() !== '' || 'Last name cannot be empty.',
                    alphabetsOnly: v => /^[A-Za-z\s]+$/.test(v) || 'Only alphabets and spaces allowed.',
                  }
                }}
              />

              <TextInput
                label="Email address"
                name="email"
                type="email"
                placeholder="buyer@publishelf.com"
                iconClass="fas fa-envelope"
                register={register}
                rules={{
                  required: 'Email is required.',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format.' },
                  validate: { noUpper: v => v === v.toLowerCase() || 'Uppercase letters are not allowed.' }
                }}
                error={errors.email}
                onBlurTrigger={trigger}
              />

              <PasswordField
                label="Password"
                name="password"
                register={register}
                rules={{ required: 'Password is required.', minLength: { value: 3, message: 'Password must be at least 3 characters long.' } }}
                error={errors.password}
                onBlurTrigger={() => { trigger('password'); trigger('confirmPassword'); }}
              />

              <PasswordStrengthMeter password={passwordValue} />

              <ConfirmPasswordField
                register={register}
                trigger={trigger}
                errors={errors}
                passwordValue={passwordValue}
              />

              <TermsCheckbox
                name="termsAccepted"
                register={register}
                rules={{ required: 'You must agree to the Terms of Service and Privacy Policy.' }}
                error={errors.termsAccepted}
                onBlurTrigger={trigger}
              />

              {serverError && (
                <p className="text-red-500 text-sm">{serverError}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white 
                  ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}
                  focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <GoogleAuthButton
                loading={isLoading || isGoogleLoading}
                onSuccess={handleGoogleSignIn}
                onError={(error) => {
                  const message = error?.message || 'Google sign-in was cancelled or failed.';
                  setServerError(message);
                  toast.error(message);
                }}
              />
            </div>
          </form>
        ) : (
          <OtpVerificationForm
            email={otpEmail}
            title="Confirm your buyer account"
            description="Enter the 6-digit code we sent to your email to finish signup."
            contextLabel="buyer signup"
            cooldownSeconds={otpCooldown}
            isVerifying={isVerifyingOtp}
            isResending={isResendingOtp}
            error={serverError}
            onBack={handleBackToSignup}
            onConfirm={handleVerifyOtp}
            onResend={handleResendOtp}
          />
        )}
      </div>
    </div>
  );
};

export default BuyerSignup;
