import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const app = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Logical Reasoning Tutor API",
      version: "1.0.0",
      description: "API documentation for the Logical Reasoning Tutor web application",
    },
    servers: [
      {
        url: "http://localhost:3000", 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./docs/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
export { swaggerSpec };
