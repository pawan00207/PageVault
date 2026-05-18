export const managerPaths = {
  "/api/manager/signup": {
    post: {
      tags: ["Manager"],
      summary: "Manager signup",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ManagerSignupRequest" }
          }
        }
      },
      responses: {
        201: { description: "Manager request submitted" },
        400: { description: "Validation error" }
      }
    }
  },
  "/api/manager/dashboard": {
    get: {
      tags: ["Manager"],
      summary: "Manager dashboard",
      security: [{ CookieAuth: [] }],
      responses: {
        200: {
          description: "Dashboard metrics",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/AnalyticsSummary" }
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
  "/api/manager/profile": {
    get: {
      tags: ["Manager"],
      summary: "Manager profile",
      security: [{ CookieAuth: [] }],
      responses: {
        200: {
          description: "Profile data",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/ManagerProfile" }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    },
    put: {
      tags: ["Manager"],
      summary: "Update profile",
      security: [{ CookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                firstname: { type: "string" },
                lastname: { type: "string" },
                phone: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Profile updated" }
      }
    }
  },
  "/api/manager/auctions/overview": {
    get: {
      tags: ["Manager", "Auctions"],
      summary: "Auction KPIs",
      security: [{ CookieAuth: [] }],
      responses: {
        200: { description: "Aggregate data" }
      }
    }
  },
  "/api/manager/auctions/pending": {
    get: {
      tags: ["Manager", "Auctions"],
      summary: "Pending auction submissions",
      security: [{ CookieAuth: [] }],
      responses: {
        200: {
          description: "Pending auctions",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/AntiqueBook" }
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
  "/api/manager/auctions/{id}": {
    get: {
      tags: ["Manager", "Auctions"],
      summary: "Auction detail",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: {
          description: "Auction detail",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/AntiqueBook" }
                    }
                  }
                ]
              }
            }
          }
        },
        404: { description: "Auction not found" }
      }
    },
    put: {
      tags: ["Manager", "Auctions"],
      summary: "Approve or reject auction",
      description: "Use approve/reject specific subroutes.",
      deprecated: true
    }
  },
  "/api/manager/auctions/{id}/approve": {
    put: {
      tags: ["Manager", "Auctions"],
      summary: "Approve auction",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: { description: "Auction approved" },
        404: { description: "Auction not found" }
      }
    }
  },
  "/api/manager/auctions/{id}/reject": {
    put: {
      tags: ["Manager", "Auctions"],
      summary: "Reject auction",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                reason: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Auction rejected" }
      }
    }
  },
  "/api/manager/publishers/pending": {
    get: {
      tags: ["Manager", "Publisher"],
      summary: "Pending publishers",
      security: [{ CookieAuth: [] }],
      responses: { 200: { description: "Pending publisher list" } }
    }
  },
  "/api/manager/publishers/{id}/approve": {
    put: {
      tags: ["Manager", "Publisher"],
      summary: "Approve publisher",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: { description: "Publisher approved" },
        404: { description: "Publisher not found" }
      }
    }
  },
  "/api/manager/publishers/{id}/ban": {
    put: {
      tags: ["Manager", "Publisher"],
      summary: "Ban publisher",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: { description: "Publisher banned" }
      }
    }
  },
  "/api/manager/publishers/{id}/reinstate": {
    put: {
      tags: ["Manager", "Publisher"],
      summary: "Reinstate publisher",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: { description: "Publisher reinstated" }
      }
    }
  }
};
