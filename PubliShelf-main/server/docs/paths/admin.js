export const adminPaths = {
  "/api/admin/auth/login": {
    post: {
      tags: ["Admin"],
      summary: "Admin login",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" }
          }
        }
      },
      responses: {
        200: { description: "Admin authenticated" },
        401: { description: "Invalid credentials" }
      }
    }
  },
  "/api/admin/analytics": {
    get: {
      tags: ["Admin"],
      summary: "Platform analytics",
      security: [{ CookieAuth: [] }],
      responses: {
        200: {
          description: "Analytics summary",
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
  "/api/admin/dashboard/{key}": {
    get: {
      tags: ["Admin"],
      summary: "Admin dashboard (legacy key)",
      description: "Requires secret dashboard key path parameter.",
      parameters: [
        {
          name: "key",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: { description: "Dashboard data" },
        401: { description: "Invalid key" }
      }
    }
  },
  "/api/admin/publishers/{id}/ban": {
    put: {
      tags: ["Admin", "Publisher"],
      summary: "Ban publisher",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: { description: "Publisher banned" },
        404: { description: "Publisher not found" }
      }
    }
  },
  "/api/admin/admins": {
    get: {
      tags: ["Admin"],
      summary: "List admin users",
      security: [{ CookieAuth: [] }],
      responses: {
        200: {
          description: "Admin collection",
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
                        items: { $ref: "#/components/schemas/AdminUser" }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    },
    post: {
      tags: ["Admin"],
      summary: "Create admin",
      description: "Super-admin only",
      security: [{ CookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["firstname", "lastname", "email"],
              properties: {
                firstname: { type: "string" },
                lastname: { type: "string" },
                email: { type: "string", format: "email" },
                isSuperAdmin: { type: "boolean" }
              }
            }
          }
        }
      },
      responses: {
        201: { description: "Admin created" },
        403: { description: "Requires super admin" }
      }
    }
  },
  "/api/admin/admins/{id}": {
    get: {
      tags: ["Admin"],
      summary: "Fetch admin by id",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Admin" }, 404: { description: "Not found" } }
    },
    delete: {
      tags: ["Admin"],
      summary: "Delete admin",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        204: { description: "Admin removed" }
      }
    }
  },
  "/api/admin/admins/{id}/change-key": {
    put: {
      tags: ["Admin"],
      summary: "Change admin key",
      description: "Super-admin only",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["newAdminKey"],
              properties: {
                newAdminKey: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Key updated" }
      }
    }
  },
  "/api/admin/admins/update-key": {
    put: {
      tags: ["Admin"],
      summary: "Update own admin key",
      security: [{ CookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["currentKey", "newKey"],
              properties: {
                currentKey: { type: "string" },
                newKey: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Key updated" }
      }
    }
  },
  "/api/admin/managers": {
    get: {
      tags: ["Admin", "Manager"],
      summary: "List managers",
      security: [{ CookieAuth: [] }],
      responses: { 200: { description: "Manager list" } }
    }
  },
  "/api/admin/managers/{id}": {
    get: {
      tags: ["Admin", "Manager"],
      summary: "Manager detail",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Manager detail" } }
    }
  },
  "/api/admin/managers/{id}/approve": {
    post: {
      tags: ["Admin", "Manager"],
      summary: "Approve manager",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Manager approved" } }
    }
  },
  "/api/admin/managers/{id}/reject": {
    post: {
      tags: ["Admin", "Manager"],
      summary: "Reject manager",
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
      responses: { 200: { description: "Manager rejected" } }
    }
  },
  "/api/admin/managers/{id}/ban": {
    post: {
      tags: ["Admin", "Manager"],
      summary: "Ban manager",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Manager banned" } }
    }
  },
  "/api/admin/managers/{id}/reinstate": {
    post: {
      tags: ["Admin", "Manager"],
      summary: "Reinstate manager",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Manager reinstated" } }
    }
  },
  "/api/admin/publishers-analytics": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Publishers analytics",
      security: [{ CookieAuth: [] }],
      responses: { 200: { description: "List with stats" } }
    }
  },
  "/api/admin/publishers-analytics/{id}": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Publisher analytics detail",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Analytics detail" }, 404: { description: "Not found" } }
    }
  },
  "/api/admin/managers-analytics": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Managers analytics",
      security: [{ CookieAuth: [] }],
      responses: { 200: { description: "Analytics list" } }
    }
  },
  "/api/admin/managers-analytics/{id}": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Manager analytics detail",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Analytics detail" } }
    }
  },
  "/api/admin/buyers-analytics": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Buyers analytics",
      security: [{ CookieAuth: [] }],
      responses: { 200: { description: "Analytics list" } }
    }
  },
  "/api/admin/buyers-analytics/{id}": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Buyer analytics detail",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Analytics detail" } }
    }
  },
  "/api/admin/books-analytics": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Book analytics",
      security: [{ CookieAuth: [] }],
      responses: { 200: { description: "Analytics list" } }
    }
  },
  "/api/admin/books-analytics/{id}": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Book analytics detail",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Analytics detail" } }
    }
  },
  "/api/admin/antique-books-analytics": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Antique book analytics",
      security: [{ CookieAuth: [] }],
      responses: { 200: { description: "Analytics list" } }
    }
  },
  "/api/admin/antique-books-analytics/{id}": {
    get: {
      tags: ["Admin", "Analytics"],
      summary: "Antique book detail stats",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: { 200: { description: "Analytics detail" } }
    }
  }
};
