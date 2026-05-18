export const authPaths = {
  "/api/auth/signup": {
    post: {
      tags: ["Authentication"],
      summary: "Create a pending account and send a verification OTP",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthSignupRequest" }
          }
        }
      },
      responses: {
        201: {
          description: "Registration started",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" }
            }
          }
        },
        400: {
          description: "Invalid signup payload",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/send-otp": {
    post: {
      tags: ["Authentication"],
      summary: "Send a verification OTP",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OTPRequest" }
          }
        }
      },
      responses: {
        200: {
          description: "OTP sent",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/verify-otp": {
    post: {
      tags: ["Authentication"],
      summary: "Verify a submitted OTP",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OTPVerifyRequest" }
          }
        }
      },
      responses: {
        200: {
          description: "OTP verified",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/resend-otp": {
    post: {
      tags: ["Authentication"],
      summary: "Resend verification OTP with cooldown checks",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OTPRequest" }
          }
        }
      },
      responses: {
        200: {
          description: "OTP resent",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/forgot-password": {
    post: {
      tags: ["Authentication"],
      summary: "Send a reset-password OTP to a registered email",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ForgotPasswordRequest" }
          }
        }
      },
      responses: {
        200: {
          description: "Reset OTP sent",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" }
            }
          }
        },
        404: {
          description: "Email not registered",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/verify-reset-otp": {
    post: {
      tags: ["Authentication"],
      summary: "Verify a password reset OTP without consuming it",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OTPVerifyRequest" }
          }
        }
      },
      responses: {
        200: {
          description: "Reset OTP verified",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/reset-password": {
    post: {
      tags: ["Authentication"],
      summary: "Verify OTP and reset password",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ResetPasswordRequest" }
          }
        }
      },
      responses: {
        200: {
          description: "Password reset successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "Login and receive JWT cookie",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" }
          }
        }
      },
      responses: {
        200: {
          description: "Authenticated successfully",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/UserBase" }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        401: {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/me": {
    get: {
      tags: ["Authentication"],
      summary: "Get currently authenticated user",
      security: [{ CookieAuth: [] }],
      responses: {
        200: {
          description: "Authenticated user profile",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/UserBase" }
                    }
                  }
                ]
              }
            }
          }
        },
        401: {
          description: "Missing/invalid cookie",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" }
            }
          }
        }
      }
    }
  },
  "/api/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Clear JWT cookie",
      security: [],
      responses: {
        200: {
          description: "Logout acknowledged",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" }
            }
          }
        }
      }
    }
  }
};
