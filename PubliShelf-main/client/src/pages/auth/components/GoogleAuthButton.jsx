import { GoogleLogin } from "@react-oauth/google";

export const GoogleAuthButton = ({
  loading = false,
  disabled = false,
  onSuccess,
  onError,
}) => {
  const isConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  if (!isConfigured) {
    return (
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed"
      >
        <i className="fab fa-google text-base"></i>
        Google sign-in is not configured
      </button>
    );
  }

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-200 bg-white text-gray-500 text-sm font-medium cursor-not-allowed shadow-sm"
      >
        <i className="fas fa-circle-notch fa-spin text-base text-gray-500"></i>
        Connecting with Google...
      </button>
    );
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-70" : ""}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (!credentialResponse?.credential) {
            onError?.(new Error("Google did not return a token"));
            return;
          }

          onSuccess?.(credentialResponse.credential, credentialResponse);
        }}
        onError={() => onError?.(new Error("Google sign-in failed or was cancelled"))}
        text="continue_with"
        shape="rectangular"
        theme="outline"
        size="large"
        width="100%"
      />
    </div>
  );
};

export default GoogleAuthButton;