import helmet from "helmet";

export const securityConfig = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
});
