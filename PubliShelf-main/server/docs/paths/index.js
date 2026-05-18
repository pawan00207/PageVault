import { authPaths } from "./auth.js";
import { buyerPaths } from "./buyer.js";
import { publisherPaths } from "./publisher.js";
import { managerPaths } from "./manager.js";
import { adminPaths } from "./admin.js";
import { systemPaths } from "./system.js";

export const paths = {
  ...authPaths,
  ...buyerPaths,
  ...publisherPaths,
  ...managerPaths,
  ...adminPaths,
  ...systemPaths
};
