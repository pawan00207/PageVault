export const schemas = {
  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed" },
      data: { type: "object", nullable: true }
    }
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" },
      data: { type: "object", nullable: true, example: null }
    }
  },
  PaginationMeta: {
    type: "object",
    properties: {
      page: { type: "integer", example: 1 },
      limit: { type: "integer", example: 10 },
      totalPages: { type: "integer", example: 5 },
      totalItems: { type: "integer", example: 42 }
    }
  },
  UserBase: {
    type: "object",
    properties: {
      _id: { type: "string", example: "65b9d4e1739bb3a41f25a9c2" },
      firstname: { type: "string", example: "Alex" },
      lastname: { type: "string", example: "Morgan" },
      email: { type: "string", format: "email" },
      role: {
        type: "string",
        enum: ["buyer", "publisher", "manager", "admin"],
        example: "buyer"
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  Address: {
    type: "object",
    properties: {
      _id: { type: "string" },
      label: { type: "string", example: "Home" },
      street: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      postalCode: { type: "string" },
      country: { type: "string" },
      isDefault: { type: "boolean" }
    }
  },
  CartItem: {
    type: "object",
    properties: {
      book: { $ref: "#/components/schemas/Book" },
      quantity: { type: "integer", minimum: 1 }
    }
  },
  OrderItem: {
    type: "object",
    properties: {
      book: { $ref: "#/components/schemas/Book" },
      quantity: { type: "integer" },
      price: { type: "number" }
    }
  },
  Order: {
    type: "object",
    properties: {
      _id: { type: "string" },
      buyer: { $ref: "#/components/schemas/UserBase" },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/OrderItem" }
      },
      total: { type: "number" },
      status: { type: "string", example: "completed" },
      createdAt: { type: "string", format: "date-time" }
    }
  },
  BuyerProfile: {
    allOf: [
      { $ref: "#/components/schemas/UserBase" },
      {
        type: "object",
        properties: {
          cart: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" }
          },
          wishlist: {
            type: "array",
            items: { type: "string" }
          },
          orders: {
            type: "array",
            items: { $ref: "#/components/schemas/Order" }
          },
          addresses: {
            type: "array",
            items: { $ref: "#/components/schemas/Address" }
          }
        }
      }
    ]
  },
  PublisherProfile: {
    allOf: [
      { $ref: "#/components/schemas/UserBase" },
      {
        type: "object",
        properties: {
          publishingHouse: { type: "string" },
          books: {
            type: "array",
            items: { $ref: "#/components/schemas/Book" }
          }
        }
      }
    ]
  },
  ManagerProfile: {
    allOf: [
      { $ref: "#/components/schemas/UserBase" },
      {
        type: "object",
        properties: {
          regions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    ]
  },
  AdminUser: {
    allOf: [
      { $ref: "#/components/schemas/UserBase" },
      {
        type: "object",
        properties: {
          isSuperAdmin: { type: "boolean" }
        }
      }
    ]
  },
  Book: {
    type: "object",
    properties: {
      _id: { type: "string" },
      title: { type: "string" },
      author: { type: "string" },
      description: { type: "string" },
      genre: { type: "string" },
      price: { type: "number" },
      quantity: { type: "integer" },
      image: { type: "string", format: "uri" },
      rating: { type: "number", minimum: 0, maximum: 5 },
      publisher: { $ref: "#/components/schemas/PublisherProfile" },
      condition: { type: "string", example: "new" },
      status: { type: "string", example: "active" },
      createdAt: { type: "string", format: "date-time" }
    }
  },
  AntiqueBook: {
    type: "object",
    properties: {
      _id: { type: "string" },
      title: { type: "string" },
      author: { type: "string" },
      startingBid: { type: "number" },
      currentBid: { type: "number" },
      auctionStart: { type: "string", format: "date-time" },
      auctionEnd: { type: "string", format: "date-time" },
      status: {
        type: "string",
        enum: ["pending", "live", "completed", "rejected"],
        example: "live"
      },
      publisher: { $ref: "#/components/schemas/PublisherProfile" }
    }
  },
  AuctionBid: {
    type: "object",
    properties: {
      _id: { type: "string" },
      bidder: { $ref: "#/components/schemas/UserBase" },
      amount: { type: "number" },
      createdAt: { type: "string", format: "date-time" }
    }
  },
  AnalyticsSummary: {
    type: "object",
    properties: {
      totalRevenue: { type: "number" },
      todayRevenue: { type: "number" },
      weekRevenue: { type: "number" },
      monthRevenue: { type: "number" },
      yearRevenue: { type: "number" },
      totalOrders: { type: "integer" },
      activePublishers: { type: "integer" },
      activeBuyers: { type: "integer" }
    }
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", format: "password" }
    }
  },
  AuthSignupRequest: {
    type: "object",
    required: ["role", "firstname", "lastname", "email", "password"],
    properties: {
      role: { type: "string", enum: ["buyer", "publisher", "manager"] },
      firstname: { type: "string" },
      lastname: { type: "string" },
      publishingHouse: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", format: "password" }
    }
  },
  OTPRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" }
    }
  },
  OTPVerifyRequest: {
    type: "object",
    required: ["email", "otp"],
    properties: {
      email: { type: "string", format: "email" },
      otp: { type: "string", example: "123456" }
    }
  },
  ForgotPasswordRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" }
    }
  },
  ResetPasswordRequest: {
    type: "object",
    required: ["email", "otp", "newPassword"],
    properties: {
      email: { type: "string", format: "email" },
      otp: { type: "string", example: "123456" },
      newPassword: { type: "string", format: "password" }
    }
  },
  PublishBookRequest: {
    type: "object",
    required: ["title", "author", "price", "quantity"],
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      description: { type: "string" },
      genre: { type: "string" },
      price: { type: "number" },
      quantity: { type: "integer" },
      condition: { type: "string" }
    }
  },
  AuctionSubmission: {
    type: "object",
    required: ["title", "author", "startingBid", "auctionStart", "auctionEnd"],
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      description: { type: "string" },
      startingBid: { type: "number" },
      auctionStart: { type: "string", format: "date-time" },
      auctionEnd: { type: "string", format: "date-time" }
    }
  },
  BuyerSignupRequest: {
    type: "object",
    required: ["firstname", "lastname", "email", "password"],
    properties: {
      firstname: { type: "string" },
      lastname: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", format: "password" }
    }
  },
  PublisherSignupRequest: {
    type: "object",
    required: ["firstname", "lastname", "email", "password", "publishingHouse"],
    properties: {
      firstname: { type: "string" },
      lastname: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", format: "password" },
      publishingHouse: { type: "string" }
    }
  },
  ManagerSignupRequest: {
    type: "object",
    required: ["firstname", "lastname", "email", "password"],
    properties: {
      firstname: { type: "string" },
      lastname: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", format: "password" },
      experience: { type: "string" }
    }
  },
  BidRequest: {
    type: "object",
    required: ["amount"],
    properties: {
      amount: { type: "number", example: 120.5 }
    }
  }
};
