# FinanceFlow API — Smart Finance Backend System

A backend system designed to manage financial records with role-based access control, built using Node.js, Express, and Prisma. This project demonstrates clean architecture, secure authentication, and efficient data processing for dashboard analytics.

## Architecture

```
Route → Middleware → Controller → Service → Repository → Database
```

This layered architecture ensures separation of concerns, testability, and maintainability. Each layer has a single responsibility:

- **Routes**: Define API endpoints and HTTP methods
- **Middleware**: Handle authentication, authorization, and cross-cutting concerns
- **Controllers**: Parse requests and delegate to services
- **Services**: Contain business logic and orchestration
- **Repositories**: Handle all database operations
- **Database**: SQLite with Prisma ORM

## Features

- ✅ User Authentication with JWT
- ✅ Role-Based Access Control (Viewer, Analyst, Admin)
- ✅ Financial Records CRUD Operations
- ✅ Soft Delete Implementation
- ✅ Advanced Filtering (category, type, date range)
- ✅ Pagination Support
- ✅ Dashboard Summary API (income, expense, balance, category breakdown)
- ✅ Input Validation with Zod
- ✅ Clean Layered Architecture
- ✅ TypeScript for Type Safety

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript Runtime |
| Express.js | Web Framework |
| TypeScript | Type Safety |
| Prisma ORM | Database Access |
| SQLite | Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Zod | Schema Validation |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate and receive JWT token

### Records Management
- `POST /api/records` - Create a new financial record
- `GET /api/records` - Get all records (with pagination, filtering)
- `PUT /api/records/:id` - Update an existing record
- `DELETE /api/records/:id` - Soft delete a record

### Dashboard
- `GET /api/records/summary` - Get income, expense, balance, and category breakdown

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd finance-flow-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run Prisma migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The server will run on `http://localhost:3000` by default.

## Request/Response Examples

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "role": "VIEWER"
  }
}
```

### Create Record
```bash
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-03",
  "notes": "Monthly salary"
}
```

### Get Records with Pagination
```bash
GET /api/records?page=1&limit=10&type=INCOME&category=Salary
Authorization: Bearer <token>

# Response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Dashboard Summary
```bash
GET /api/records/summary
Authorization: Bearer <token>

# Response
{
  "totalIncome": 5000,
  "totalExpense": 2000,
  "netBalance": 3000,
  "categoryBreakdown": {
    "Salary": 5000,
    "Groceries": 200
  },
  "recentActivity": [...]
}
```

## Role-Based Access Control

| Role | CREATE | READ | UPDATE | DELETE |
|------|--------|------|--------|--------|
| VIEWER | ❌ | ✅ | ❌ | ❌ |
| ANALYST | ✅ | ✅ | ✅ | ❌ |
| ADMIN | ✅ | ✅ | ✅ | ✅ |

## Key Design Decisions

### SQLite for Development
SQLite provides zero-setup, file-based database perfect for development and small-scale deployments. For production, this can be upgraded to PostgreSQL by changing the Prisma provider.

### String-Based Enums
Instead of database enums (not supported in SQLite), we use string fields with application-level validation for flexibility and compatibility.

### Soft Delete Pattern
Records are never permanently deleted - only marked as deleted with `isDeleted` flag. This allows for audit trails and potential recovery.

### JWT Authentication
Stateless authentication using JSON Web Tokens. Tokens are generated at login and validated on each protected request.

### Repository Pattern
All database queries are abstracted in repository classes, making it easy to swap implementations or add caching layers.

## Project Structure

```
finance-flow-backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── config/
│   │   └── database.ts       # Prisma client initialization
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   ├── repositories/         # Database access
│   ├── routes/               # API endpoints
│   ├── middleware/           # Authentication & Authorization
│   ├── validators/           # Input validation schemas
│   └── types/                # TypeScript type definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── dev.db                # SQLite database file
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Error Handling

The API returns appropriate HTTP status codes:

- `400 Bad Request` - Invalid input or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions for the requested action
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Unexpected server error

## Performance Considerations

- Pagination limits the number of records returned per request
- Soft delete queries filter out deleted records efficiently
- Category breakdown is computed in-memory for analytical accuracy
- Proper indexing on frequently queried fields (userId, date)

## Testing the API

You can test the API using tools like Postman, curl, or VS Code REST Client. Example `.http` file:

```http
### Register
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

## Future Enhancements

- Database migration to PostgreSQL for production
- Unit and integration tests with Jest
- API documentation with Swagger/OpenAPI
- Rate limiting and security hardening
- Multi-tenant support
- Advanced analytics and reporting

## Assumptions

- **SQLite for Development**: Used for simplicity; production should use PostgreSQL
- **Roles Enforced via Middleware**: Authorization checks happen on every protected route
- **Soft Delete Instead of Hard Delete**: Records are marked deleted, not removed from database
- **JWT Expiration**: Tokens have standard expiration; implement refresh tokens for longer sessions
- **Single Admin Role**: Assumes one admin manages all users

## Contributing

This is a portfolio project. For improvements or suggestions, please fork and submit a pull request.

## License

ISC License - See LICENSE file for details

---

**Built with ❤️ by Rohith for demonstrating clean backend architecture and best practices.**
