import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'API documentation for Personal_CRM',
    },
    servers: [
      { 
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Server'
       }
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Contacts',
        description: 'Contact management operations'
      },
      {
        name: 'Notes',
        description: 'Note management operations'
      },
      {
        name: 'Interactions',
        description: 'Interaction tracking operations'
      },
      {
        name: 'Insights',
        description: 'Analytics and insights'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // path to route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// DEBUG: Log the generated spec
// console.log('Swagger Spec:', JSON.stringify(swaggerSpec, null, 2));

export default(app) =>{app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}; 