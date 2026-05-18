export const publisherPaths = {
  "/api/publisher/signup": {
    post: {
      tags: ["Publisher"],
      summary: "Register publisher",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/PublisherSignupRequest" }
          }
        }
      },
      responses: {
        201: { description: "Publisher created" },
        400: { description: "Validation error" }
      }
    }
  },
  "/api/publisher/profile": {
    get: {
      tags: ["Publisher"],
      summary: "Get publisher profile",
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
                      data: { $ref: "#/components/schemas/PublisherProfile" }
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
      tags: ["Publisher"],
      summary: "Update publisher profile",
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
                publishingHouse: { type: "string" }
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
  "/api/publisher/publish-book": {
    post: {
      tags: ["Publisher"],
      summary: "Publish a book",
      description: "Accepts multipart/form-data with `imageFile` for cover art.",
      security: [{ CookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              allOf: [
                { $ref: "#/components/schemas/PublishBookRequest" },
                {
                  type: "object",
                  properties: {
                    imageFile: {
                      type: "string",
                      format: "binary",
                      description: "Cover image"
                    }
                  }
                }
              ]
            }
          }
        }
      },
      responses: {
        201: {
          description: "Book published",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Book" }
                    }
                  }
                ]
              }
            }
          }
        },
        400: { description: "Validation error" }
      }
    }
  },
  "/api/publisher/sell-antique": {
    post: {
      tags: ["Publisher", "Auctions"],
      summary: "Submit an antique book for auction",
      description: "Multipart payload with media evidence.",
      security: [{ CookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              allOf: [
                { $ref: "#/components/schemas/AuctionSubmission" },
                {
                  type: "object",
                  properties: {
                    itemImage: { type: "string", format: "binary" },
                    "authenticationImages[]": {
                      type: "array",
                      items: { type: "string", format: "binary" }
                    }
                  }
                }
              ]
            }
          }
        }
      },
      responses: {
        201: { description: "Auction request submitted" },
        400: { description: "Validation error" }
      }
    }
  },
  "/api/publisher/book/{id}": {
    get: {
      tags: ["Publisher"],
      summary: "Fetch publisher book",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: {
          description: "Book",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Book" }
                    }
                  }
                ]
              }
            }
          }
        },
        404: { description: "Book not found" }
      }
    },
    put: {
      tags: ["Publisher"],
      summary: "Update book",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              allOf: [
                { $ref: "#/components/schemas/PublishBookRequest" },
                {
                  type: "object",
                  properties: {
                    imageFile: { type: "string", format: "binary" }
                  }
                }
              ]
            }
          }
        }
      },
      responses: {
        200: { description: "Book updated" }
      }
    },
    delete: {
      tags: ["Publisher"],
      summary: "Soft-delete book",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        204: { description: "Book deleted" }
      }
    }
  },
  "/api/publisher/book/{id}/restore": {
    put: {
      tags: ["Publisher"],
      summary: "Restore soft-deleted book",
      security: [{ CookieAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: { description: "Book restored" },
        404: { description: "Book not found" }
      }
    }
  }
};
