import { schemas } from "./schemas.js";

export const components = {
  schemas,
  securitySchemes: {
    CookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "token",
      description: "JWT authentication cookie issued on login"
    }
  }
};
