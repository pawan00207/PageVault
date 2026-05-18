export const buyerPaths = {
  "/api/buyer/signup": {
    post: {
      tags: ["Buyer"],
      summary: "Register a new buyer",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BuyerSignupRequest" }
          }
        }
      },
      responses: {
        201: {
          description: "Buyer created"
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" }
            }
          }
        }
      }
    }
  },
  "/api/buyer/dashboard": {
    get: {
      tags: ["Buyer"],
      summary: "Buyer dashboard with recommendations",
      security: [{ CookieAuth: [] }],
      responses: {
        200: {
          description: "Dashboard data",
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
                          trendingBooks: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Book" }
                          },
                          mostSoldBooks: {
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
  "/api/buyer/search": {
    get: {
      tags: ["Buyer"],
      summary: "Search catalog",
      security: [{ CookieAuth: [] }],
      parameters: [
        {
          name: "q",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Keyword (title, author, genre)"
        }
      ],
      responses: {
        200: {
          description: "Matching books",
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
                        items: { $ref: "#/components/schemas/Book" }
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
  "/api/buyer/cart": {
    get: {
      tags: ["Buyer"],
      summary: "View cart",
      security: [{ CookieAuth: [] }],
      responses: {
        200: {
          description: "Cart contents",
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
                        items: { $ref: "#/components/schemas/CartItem" }
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
  "/api/buyer/cart/add": {
    post: {
      tags: ["Buyer"],
      summary: "Add a book to cart",
      security: [{ CookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["bookId", "quantity"],
              properties: {
                bookId: { type: "string" },
                quantity: { type: "integer", minimum: 1 }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Cart updated" },
        404: { description: "Book not found" }
      }
    }
  },
  "/api/buyer/cart/remove": {
    delete: {
      tags: ["Buyer"],
      summary: "Remove a book from cart",
      security: [{ CookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["bookId"],
              properties: {
                bookId: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Item removed" },
        404: { description: "Book not found" }
      }
    }
  },
  "/api/buyer/cart/update-quantity": {
    patch: {
      tags: ["Buyer"],
      summary: "Update quantity for a cart item",
      security: [{ CookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["bookId", "quantity"],
              properties: {
                bookId: { type: "string" },
                quantity: { type: "integer", minimum: 1 }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Quantity updated" },
        404: { description: "Book not found" }
      }
    }
  },
  "/api/buyer/checkout/place-order": {
    post: {
      tags: ["Buyer"],
      summary: "Place an order with current cart",
      security: [{ CookieAuth: [] }],
      responses: {
        201: {
          description: "Order placed",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Order" }
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
  "/api/buyer/profile": {
    get: {
      tags: ["Buyer"],
      summary: "Buyer profile",
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
                      data: { $ref: "#/components/schemas/BuyerProfile" }
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
      tags: ["Buyer"],
      summary: "Update buyer profile",
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
  "/api/buyer/addresses": {
    get: {
      tags: ["Buyer"],
      summary: "List buyer addresses",
      security: [{ CookieAuth: [] }],
      responses: {
        200: {
          description: "Address list",
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
                        items: { $ref: "#/components/schemas/Address" }
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
      tags: ["Buyer"],
      summary: "Create buyer address",
      security: [{ CookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Address" }
          }
        }
      },
      responses: {
        201: { description: "Address stored" }
      }
    }
  },
  "/api/buyer/addresses/{addressId}": {
    put: {
      tags: ["Buyer"],
      summary: "Update address",
      security: [{ CookieAuth: [] }],
      parameters: [
        {
          name: "addressId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Address" }
          }
        }
      },
      responses: {
        200: { description: "Address updated" }
      }
    },
    delete: {
      tags: ["Buyer"],
      summary: "Delete address",
      security: [{ CookieAuth: [] }],
      parameters: [
        {
          name: "addressId",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        204: { description: "Address deleted" }
      }
    }
  },
  "/api/buyer/auctions/{id}/bid": {
    post: {
      tags: ["Buyer", "Auctions"],
      summary: "Place a bid on an auction",
      security: [{ CookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BidRequest" }
          }
        }
      },
      responses: {
        201: { description: "Bid accepted" },
        400: { description: "Bid below minimum" },
        404: { description: "Auction not found" }
      }
    }
  }
};
