import { components } from "./components/index.js";
import { paths } from "./paths/index.js";

const tags = [
  { name: "Authentication", description: "Login & token verification" },
  { name: "Buyer", description: "Buyer experiences and carts" },
  { name: "Publisher", description: "Publisher workflows" },
  { name: "Manager", description: "Regional manager workflows" },
  { name: "Admin", description: "Platform administration" },
  { name: "Analytics", description: "Aggregated metrics endpoints" },
  { name: "Auctions", description: "Auction submissions and bids" },
  { name: "System", description: "Health checks and utilities" }
];

export const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "PubliShelf API",
    description:
      "Interactive reference for PubliShelf core business endpoints including authentication, buyer flows, publisher submissions, auction management, and admin analytics.",
    version: "1.0.0"
  },
  externalDocs: {
    description: "Legacy markdown documentation",
    url: "https://github.com/vitesh-reddy/PubliShelf_WBD/blob/main/server/API_DOC.md"
  },
  servers: [
    {
      url: process.env.API_BASE_URL || "http://localhost:3000",
      description: "Local development"
    }
  ],
  tags,
  components,
  paths
};
