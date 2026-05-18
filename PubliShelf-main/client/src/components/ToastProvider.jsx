// src/components/ToastProvider.jsx
import { Toaster } from "sonner"

export default () => {
  return (
    <Toaster
      position="top-center"
      closeButton
      toastOptions={{
        duration: 3000,
        style: {
          width: "clamp(300px, max-content, 400px)",
          padding: "1rem 1.2rem",
          borderRadius: "18px",
          background: "rgba(0, 0, 0, 0)",
          backdropFilter: "blur(2px) saturate(180%)",
          WebkitBackdropFilter: "blur(2px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.22)",
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.35),
            inset 0 -1px 6px rgba(255,255,255,0.06),
            0 10px 28px rgba(0,0,0,0.35)
          `,

          color: "black",
          fontSize: "17px",
          fontWeight: 500,
          textShadow: "0 0.3px 0.4px rgba(0,0,0,0.18)",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
        },
        success: {
          style: {
            borderRadius: "18px",
            background: "rgba(75, 192, 148, 0)",

            backdropFilter: "blur(2px) saturate(180%)",
            WebkitBackdropFilter: "blur(2px) saturate(180%)",

            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.4),
              inset 0 -1px 6px rgba(255,255,255,0.06),
              0 10px 28px rgba(0,0,0,0.35)
            `,
            color: "black",
            textShadow: "0 0.3px 0.4px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            textAlign: "center",
          },
        },

        error: {
          style: {
            borderRadius: "18px",
            background: "rgba(207, 75, 0, 0)",

            backdropFilter: "blur(2px) saturate(180%)",
            WebkitBackdropFilter: "blur(2px) saturate(180%)",

            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.4),
              inset 0 -1px 6px rgba(255,255,255,0.06),
              0 10px 28px rgba(0,0,0,0.35)
            `,
            color: "black",
            textShadow: "0 0.3px 0.4px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
          },
        },
      }}
    />
  );
};
