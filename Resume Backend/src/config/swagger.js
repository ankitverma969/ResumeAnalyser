import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const isProduction = process.env.NODE_ENV === 'production';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ATS Resume Analyzer API',
      version: '1.0.0',
      description: 'API documentation for ATS Resume Analyzer application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: isProduction
          ? 'https://your-api-url.com'
          : 'http://localhost:5000',
        description: isProduction ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in format: Bearer <token>',
        },
      },
    },
  },

  // 🔥 THIS FIXES "No operations defined in spec"
  apis: [
    'src/routes/*.js',        // main route files
    'src/controllers/*.js',   // optional (if you add docs there later)
  ],
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true, // keeps JWT after refresh
      },
    })
  );

  console.log('📄 Swagger docs available at http://localhost:5000/api-docs');
};

export { swaggerDocs };