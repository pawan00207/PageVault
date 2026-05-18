import swaggerJsdoc from "swagger-jsdoc";
import { swaggerDefinition } from "../docs/swaggerDefinition.js";

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
