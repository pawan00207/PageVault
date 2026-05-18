export const systemPaths = {
  "/api/home/data": {
    get: {
      tags: ["System"],
      summary: "Public home page data",
      security: [],
      responses: {
        200: {
          description: "Home payload",
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
                          newlyBooks: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Book" }
                          },
                          mostSoldBooks: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Book" }
                          },
                          trendingBooks: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Book" }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  "/api/logout": {
    post: {
      tags: ["System"],
      summary: "Logout helper (public)",
      security: [],
      responses: { 200: { description: "Cookie cleared" } }
    }
  },
  "/ready": {
    get: {
      tags: ["System"],
      summary: "Readiness probe",
      security: [],
      responses: { 200: { description: "Service ready" } }
    }
  },
  "/health": {
    get: {
      tags: ["System"],
      summary: "Health probe",
      security: [],
      responses: { 200: { description: "Service healthy" } }
    }
  },
  "/api/analytics/visit": {
    post: {
      tags: ["System"],
      summary: "Record anonymous visit",
      security: [],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                deviceId: { type: "string" }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Visit recorded" } }
    }
  },
  "/api/system/stats": {
    get: {
      tags: ["System"],
      summary: "System-wide counters",
      security: [],
      responses: {
        200: {
          description: "Stats payload"
        }
      }
    }
  }
};
