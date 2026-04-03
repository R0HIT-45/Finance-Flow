import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinanceFlow API',
      description: 'Finance backend with role-based access control and analytics. Manage financial records, user authentication, and track your finances with powerful dashboard analytics.',
      version: '1.0.0',
      contact: {
        name: 'Finance Flow Support',
        email: 'support@financeflow.dev',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://financeflow-api.render.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication. Include in Authorization header as: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            role: {
              type: 'string',
              enum: ['VIEWER', 'ANALYST', 'ADMIN'],
              description: 'User role for access control',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE'],
              description: 'User account status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        Record: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique record identifier',
            },
            userId: {
              type: 'string',
              description: 'User who owns this record',
            },
            amount: {
              type: 'number',
              description: 'Transaction amount',
            },
            type: {
              type: 'string',
              enum: ['INCOME', 'EXPENSE'],
              description: 'Transaction type',
            },
            category: {
              type: 'string',
              description: 'Transaction category (e.g., Salary, Rent, Food)',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction date',
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Optional transaction notes',
            },
            isDeleted: {
              type: 'boolean',
              description: 'Soft delete flag',
            },
          },
        },
        Summary: {
          type: 'object',
          properties: {
            totalIncome: {
              type: 'number',
              description: 'Total income across all records',
            },
            totalExpense: {
              type: 'number',
              description: 'Total expenses across all records',
            },
            netBalance: {
              type: 'number',
              description: 'Net balance (income - expense)',
            },
            categoryBreakdown: {
              type: 'object',
              description: 'Total amount by category',
              additionalProperties: {
                type: 'number',
              },
            },
            recentActivity: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Record',
              },
              description: 'Last 5 recent transactions',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            errors: {
              type: 'array',
              description: 'Validation error details',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User registration and login endpoints',
      },
      {
        name: 'Records',
        description: 'Financial record management (CRUD operations)',
      },
      {
        name: 'Dashboard',
        description: 'Analytics and summary endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
