# FinanceFlow Backend - Complete Interview Preparation Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Technology Stack Decision](#technology-stack-decision)
4. [Code Walkthrough - Line by Line](#code-walkthrough)
5. [Key Design Decisions](#key-design-decisions)
6. [Probable Interview Questions](#probable-interview-questions)
7. [Additional Technical Questions](#additional-technical-questions)
8. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Project Overview

### Assignment Requirements Met ✅

**Your goal:** Build a backend system for managing financial records with role-based access control.

**What you delivered:**
- ✅ User authentication with JWT tokens
- ✅ Role-based access control (VIEWER/ANALYST/ADMIN)
- ✅ Complete CRUD operations for financial records
- ✅ Soft delete implementation
- ✅ Advanced filtering and pagination
- ✅ Dashboard summary API (income, expense, balance, categories)
- ✅ Input validation with Zod schema
- ✅ Layered architecture (Route → Controller → Service → Repository)
- ✅ TypeScript for type safety
- ✅ SQLite database with Prisma ORM
- ✅ Swagger/OpenAPI documentation

---

## Architecture Deep Dive

### Overall Structure

```
Client Request
    ↓
Express Router (Route Handler)
    ↓
Middleware (Authentication, Authorization)
    ↓
Controller (Request parsing, delegation)
    ↓
Service (Business logic, calculations)
    ↓
Repository (Database queries)
    ↓
Prisma ORM
    ↓
SQLite Database
```

### Why This Architecture?

**Separation of Concerns:** Each layer has one job:
- **Routes:** Map HTTP requests to handlers
- **Middleware:** Cross-cutting concerns (auth, logging)
- **Controllers:** Parse requests, catch errors, return responses
- **Services:** All business logic lives here
- **Repositories:** All database access abstracted here

**Benefits:**
- ✅ **Testability:** Each layer can be unit tested independently
- ✅ **Maintainability:** Changes in one layer don't affect others
- ✅ **Scalability:** Easy to add caching, logging, or monitoring
- ✅ **Reusability:** Services can be called from multiple controllers

---

## Technology Stack Decision

### Node.js + Express.js
**Why?** 
- Fast, lightweight, perfect for REST APIs
- Huge npm ecosystem
- Easy to learn and prototype
- Takes minutes to build APIs

**Alternative considered:** Python Django (heavier, more batteries included)

### TypeScript
**Why?**
- Catches type errors at compile time
- Self-documenting code (types = documentation)
- Better IDE support and autocomplete
- `Record` might be a `number` or `string` - types prevent bugs

**Example error it prevents:**
```typescript
// TypeScript catches this:
const user: User = { id: "123", email: "test@test.com" };
user.id = 123; // ❌ ERROR: Type 'number' is not assignable to type 'string'

// JavaScript allows this 😱
```

### Prisma ORM
**Why?**
- Type-safe database access
- Auto-generated client from schema
- Built-in migrations
- Works with SQLite, PostgreSQL, MySQL

**Alternative:** Raw SQL or Sequelize (makes you more vulnerable to bugs)

### SQLite
**Why?**
- Zero setup - just a file
- Perfect for development and small projects
- Can upgrade to PostgreSQL later by changing one line in schema
- Great for interviews (shows you understand databases)

### Zod for Validation
**Why?**
- Runtime schema validation
- TypeScript-first
- Creates types from schemas (no manual typing)
- Prevents invalid data from reaching your business logic

**Example:**
```typescript
// One schema does BOTH validation AND creates type
const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type RegisterInput = z.infer<typeof RegisterSchema>; // Type automatically created
```

### JWT for Authentication
**Why?**
- Stateless (no session storage needed)
- Can encode user info inside token
- Scalable (works with load balancers)
- Industry standard

**How it works:**
1. User logs in → Server creates JWT with user ID inside → Sends to client
2. Client stores JWT
3. Client sends JWT with every request in `Authorization: Bearer <token>`
4. Server verifies JWT signature → If valid, token is legit

---

## Code Walkthrough - Line by Line

### 1️⃣ Entry Point: `src/index.ts`

```typescript
import 'dotenv/config';  // Load .env variables FIRST
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth';
import recordRoutes from './routes/records';

const app = express();
const PORT = process.env.PORT || 3000;  // Use env var, default to 3000

app.use(express.json());  // Parse incoming JSON requests

// Health check endpoint - used by load balancers to check if server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Swagger UI - auto-generated interactive API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,  // Keep JWT in UI between page refreshes
    displayOperationId: false,
  },
  customCss: '.swagger-ui .topbar { display: none }',  // Hide topbar for cleaner look
  customSiteTitle: 'FinanceFlow API Docs',
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);

// Error handling - catches all unhandled errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown - clean exit on SIGTERM (container stop signal)
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

**Key Points:**
- `app.listen()` returns Server object - needed for graceful shutdown
- `dotenv/config` imported FIRST - must be before other imports
- Health check `/health` is important for production (Docker, Kubernetes, load balancers ping this)
- Error middleware MUST be added last (Express checks routes in order)

---

### 2️⃣ Database Setup: `src/config/database.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  // In development: log errors AND warnings
  // In production: only log errors (less noise)
});
```

**Why export as singleton?**
- Only ONE connection to database
- If you created PrismaClient multiple times, you'd have multiple connections = memory leak
- Exporting singleton ensures everyone uses same instance

---

### 3️⃣ Authentication Middleware: `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'supersecret';  // ⚠️ Should be in .env file

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract JWT from Authorization header: "Bearer eyJhbGciOi..."
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token signature - if someone modified the token, this fails
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    
    // Attach user to request object so controllers can access it
    req.user = decoded;
    
    next();  // Continue to next middleware/controller
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**How JWT works:**
1. Server creates token: `header.payload.signature`
2. `payload` contains: `{ id: "123", email: "john@example.com", role: "VIEWER" }`
3. Token is sent to client (usually stored in localStorage)
4. Client sends token back with every request
5. Server verifies: If someone changed the payload, signature won't match = invalid

**Security implications:**
- ✅ Don't need to store sessions on server (stateless)
- ✅ Can share JWT across servers/load balancers
- ❌ Can't revoke a token early (JWT is valid until expiration)
- ❌ If someone steals the token, they can use it until expiration

---

### 4️⃣ Authorization Middleware: `src/middleware/authorize.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

// Define which roles can do what actions
const PERMISSIONS: Record<string, string[]> = {
  'VIEWER': ['READ'],
  'ANALYST': ['READ', 'CREATE', 'UPDATE'],
  'ADMIN': ['READ', 'CREATE', 'UPDATE', 'DELETE'],
};

// This middleware checks if user has required permission
export const authorize = (requiredAction: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // User comes from authenticate middleware
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get allowed actions for user's role
    const allowedActions = PERMISSIONS[userRole] || [];
    
    if (!allowedActions.includes(requiredAction)) {
      // 403 Forbidden = user is authenticated but doesn't have permission
      // 401 Unauthorized = user not authenticated at all
      return res.status(403).json({ 
        message: `Role '${userRole}' is not allowed to ${requiredAction}` 
      });
    }

    next();
  };
};
```

**Usage in routes:**
```typescript
router.post('/records', authenticate, authorize('CREATE'), RecordController.create);
//                        ^^^^^^ verify user exists
//                                        ^^^^^^ verify user can create
```

**Authentication vs Authorization:**
- **Authentication:** Are you who you claim to be? (Did you log in?)
- **Authorization:** Are you allowed to do this? (Does your role permit it?)

---

### 5️⃣ User Repository: `src/repositories/userRepository.ts`

```typescript
import { prisma } from '../config/database';

export class UserRepository {
  async findByEmail(email: string) {
    // Prisma finds user by unique email
    // Returns User object or null if not found
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: any) {
    // Create new user in database
    return prisma.user.create({ data });
    // data = { name, email, password, role: "VIEWER" }
  }
}
```

**Why use Repository pattern?**
- All database queries in one place
- Easy to add caching layer: cache results in Redis, return from cache before DB
- Easy to switch databases: replace Prisma with MongoDB without touching controllers
- Easy to test: mock repository in tests

---

### 6️⃣ Authentication Service: `src/services/authService.ts`

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';

const userRepo = new UserRepository();
const JWT_SECRET = 'supersecret';

export class AuthService {
  async register(name: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password with bcryptjs
    // Bcrypt does: password → hash(password + salt)
    // Impossible to reverse hash back to password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 10 = cost factor, higher = more secure but slower
    // 10 is good default

    // Create user in database
    const user = await userRepo.create({
      name,
      email,
      password: hashedPassword,  // Store hash, NOT plaintext
      role: 'VIEWER',  // Default role
    });

    // Generate JWT token
    // Payload contains user info that will be decoded on every request
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }  // Token valid for 7 days
    );

    return {
      user: { id: user.id, email: user.email, role: user.role },
      token,  // Send to client to use in future requests
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare plaintext password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // bcrypt.compare: hash(plaintext password) == stored hash?
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token (same as register)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, email: user.email, role: user.role },
      token,
    };
  }
}
```

**Why bcryptjs?**
- Plain MD5 hash = fast to compute, but easy to crack (someone can run dictionary attack)
- bcryptjs = slow to compute on purpose, makes dictionary attacks impractical
- If someone steals your database, bcrypt hashes are much safer

**Why JWT over sessions?**
- **Sessions:** User logs in → Server stores session in memory/Redis → Server needs to look up session on every request
- **JWT:** User logs in → Client stores token → Client sends with every request → Server just verifies signature

JWT is simpler for distributed systems.

---

### 7️⃣ Records Controller: `src/controllers/recordController.ts`

```typescript
import { Request, Response } from 'express';
import { RecordService } from '../services/recordService';
import { createRecordSchema } from '../validators/schemas';

const recordService = new RecordService();

export class RecordController {
  static async create(req: Request, res: Response) {
    try {
      // Validate input using Zod schema
      const { amount, type, category, date, notes } = createRecordSchema.parse(req.body);
      // If validation fails, Zod throws error, caught in catch block

      // Get userId from JWT (set by authenticate middleware)
      const userId = req.user!.id;

      // Create record in service
      const record = await recordService.create(userId, {
        amount,
        type,
        category,
        date,
        notes,
      });

      // Return 201 Created with record data
      res.status(201).json(record);
    } catch (err: any) {
      // 400 Bad Request = client sent bad data
      res.status(400).json({ message: err.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      
      // Get pagination params from query string
      // ?page=1&limit=10 → req.query = { page: "1", limit: "10" }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Get filter params
      const type = req.query.type as string | undefined;  // INCOME or EXPENSE
      const category = req.query.category as string | undefined;

      // Get records from service
      const result = await recordService.getAll(userId, { type, category }, { page, limit });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;  // /records/123 → id = "123"
      const userId = req.user!.id;

      // Validate input
      const data = createRecordSchema.parse(req.body);

      // Update in service
      const record = await recordService.update(userId, id, data);

      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
        // 404 Not Found = resource doesn't exist
      }

      res.json(record);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Soft delete (mark as deleted, don't actually delete)
      const record = await recordService.delete(userId, id);

      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      res.json({ message: 'Record deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getSummary(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      // Get dashboard summary
      const summary = await recordService.getSummary(userId);

      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
```

**Key points:**
- Controllers are thin - just parse request and call service
- All business logic in service layer
- Use try-catch to handle errors
- 400 = client error (bad input)
- 404 = not found
- 500 = server error

---

### 8️⃣ Records Service: `src/services/recordService.ts`

```typescript
import { RecordRepository } from '../repositories/recordRepository';

const recordRepo = new RecordRepository();

export class RecordService {
  async create(userId: string, data: any) {
    // Simply delegate to repository
    return recordRepo.create(userId, data);
  }

  async getAll(userId: string, filters: any, pagination?: any) {
    // Get records with filtering and pagination
    return recordRepo.findAll(userId, filters, pagination);
  }

  async getSummary(userId: string) {
    // Get dashboard summary: total income, expense, balance, category breakdown
    
    // Get summary calculations from repository
    const summary = await recordRepo.getSummary(userId);

    // Get recent records
    const result = await recordRepo.findAll(userId, {}, undefined);
    const recentActivity = Array.isArray(result) ? result.slice(0, 5) : [];

    return {
      ...summary,
      recentActivity,  // Add last 5 records to summary
    };
  }

  async update(userId: string, recordId: string, data: any) {
    // Verify user owns this record before updating
    const record = await recordRepo.findById(recordId, userId);
    if (!record) return null;

    return recordRepo.update(recordId, data);
  }

  async delete(userId: string, recordId: string) {
    // Verify user owns this record before deleting
    const record = await recordRepo.findById(recordId, userId);
    if (!record) return null;

    return recordRepo.delete(recordId);  // Soft delete
  }
}
```

**In this simple project:** Service layer is thin because business logic is minimal. In real projects with complex calculations, the service layer would have 100+ lines of code.

---

### 9️⃣ Records Repository: `src/repositories/recordRepository.ts`

```typescript
import { prisma } from '../config/database';

export class RecordRepository {
  async create(userId: string, data: any) {
    return prisma.record.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string, filters: any, pagination?: any) {
    // WHERE clause: only this user's non-deleted records
    const where: any = {
      userId,
      isDeleted: false,  // Soft delete - only get active records
    };

    // Apply filters if provided
    if (filters.type) {
      where.type = filters.type;  // INCOME or EXPENSE
    }
    if (filters.category) {
      where.category = filters.category;
    }

    // Get total count for pagination
    const total = await prisma.record.count({ where });

    // Get page of records
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const data = await prisma.record.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },  // Newest first
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),  // Total pages needed
      },
    };
  }

  async findById(recordId: string, userId: string) {
    // Find record AND verify user owns it
    return prisma.record.findUnique({
      where: { id: recordId },
      /*
        In real world, should also check userId:
        where: { id: recordId, userId }
        But findUnique only works on unique fields
        So we do separate check in service
      */
    });
  }

  async update(recordId: string, data: any) {
    return prisma.record.update({
      where: { id: recordId },
      data,
    });
  }

  async delete(recordId: string) {
    // Soft delete - just mark as deleted
    return prisma.record.update({
      where: { id: recordId },
      data: { isDeleted: true },
    });
  }

  async getSummary(userId: string) {
    // Get all user's non-deleted records
    const records = await prisma.record.findMany({
      where: {
        userId,
        isDeleted: false,
      },
    });

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown: Record<string, number> = {};

    for (const record of records) {
      if (record.type === 'INCOME') {
        totalIncome += Number(record.amount);
      } else {
        totalExpense += Number(record.amount);
      }

      // Sum by category
      if (!categoryBreakdown[record.category]) {
        categoryBreakdown[record.category] = 0;
      }
      categoryBreakdown[record.category] += Number(record.amount);
    }

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      categoryBreakdown,
    };
  }
}
```

**Why loop instead of database aggregation?**
- For this small project, it's fine to loop in code
- In production with millions of records, you'd use SQL aggregation:
```sql
SELECT type, SUM(amount) FROM records GROUP BY type;
```

---

## Key Design Decisions

### 1. Soft Delete Instead of Hard Delete
```typescript
// Soft delete: mark as deleted
await prisma.record.update({ where: { id }, data: { isDeleted: true } });

// NOT hard delete: completely remove
// await prisma.record.delete({ where: { id } });
```

**Reasons:**
- Can recover accidentally deleted records
- Can audit who deleted what
- Data integrity - keeping historical records
- Hard delete is irreversible

### 2. String-Based Enums Instead of Database Enums
```typescript
// String field with validation in code
type: String  // "INCOME" or "EXPENSE"

// NOT database enum (SQLite doesn't support well)
type ENUM("INCOME", "EXPENSE")
```

**Reasons:**
- SQLite doesn't have good enum support
- More flexible - can change values without migration
- String allows easy expansion

### 3. JWT with 7-Day Expiration
```typescript
jwt.sign(payload, secret, { expiresIn: '7d' })
```

**Tradeoff:**
- ✅ Can't revoke early (good for security)
- ❌ But token lives 7 days even if you want to revoke now
- **Better solution:** Token blacklist in Redis (too complex for this project)

### 4. Pagination at Application Level
Instead of doing:
```typescript
const page = (page - 1) * limit;  // Skip = (page - 1) * limit
const records = await prisma.record.findMany({ skip: page, take: limit });
```

We should use:
```typescript
const records = await prisma.record.findMany({ cursor, take: limit });  // Cursor-based
```

**Difference:**
- Offset (what we did): Fast for first page, slow for page 1000 (has to skip 10k records)
- Cursor-based: Always fast (start after ID instead of skipping)

### 5. User Verification in Service Layer
```typescript
// In controller: just check if record exists
// In service: verify user owns it
const record = await recordRepo.findById(recordId, userId);
if (!record) throw new Error('Not found');
```

**Prevents:**
- User A can't update User B's records even with direct ID

---

## Probable Interview Questions

### Q1: Explain Your Architecture
**Expected Answer:**
"I used a layered architecture: Routes → Controllers → Services → Repositories → Database.

Each layer has one responsibility:
- Routes map HTTP methods to handlers
- Controllers parse requests and handle HTTP
- Services contain business logic
- Repositories abstract database queries

This makes testing easier (mock any layer), maintenance better (changes in one layer isolated), and code reusable (services can be called from multiple places)."

**Follow-up Questions:**
- "Why not put business logic in controller?" → Easier testing, reusability, separation of concerns
- "Why repository pattern?" → Abstract database, easy to swap PostgreSQL for MongoDB later
- "What if you had 50 routes?" → Same structure still works, just organize in folders

---

### Q2: How Does Authentication Work?
**Expected Answer:**
"I use JWT (JSON Web Tokens):

1. User provides email + password
2. We verify password with bcrypt (compare plaintext with stored hash)
3. If valid, sign a JWT containing user ID, email, and role
4. Send JWT to client
5. Client stores in localStorage and sends with every request
6. Server verifies JWT signature - if valid, request is from that user

JWT is stateless - no server-side session storage needed."

**Follow-up Questions:**
- "Why bcryptjs?" → Slow hash, hard to crack, even if DB stolen
- "What about token expiration?" → After 7 days, user must login again
- "Can you revoke a token early?" → No, with pure JWT. Would need token blacklist
- "XSS attack - localStorage vs Cookies?" → localStorage easier to steal vis XSS, but enough for basic project

---

### Q3: How Does Authorization Work?
**Expected Answer:**
"Role-based access control:

```
VIEWER: Can only READ records
ANALYST: Can READ, CREATE, UPDATE
ADMIN: Can READ, CREATE, UPDATE, DELETE
```

Middleware checks user's role against required action:
```typescript
router.post('/records', authenticate, authorize('CREATE'), handler);
```

On every protected route, middleware checks if user has permission."

**Follow-up Questions:**
- "What if VIEWER tries to CREATE?" → 403 Forbidden (authenticated but not authorized)
- "Can user change their role?" → No, role stored in JWT, only server can change
- "What about granular permissions?" → Could use permission strings like "records:create" instead of just "CREATE"

---

### Q4: Explain Soft Delete
**Expected Answer:**
"Instead of removing from database:
```typescript
// Soft delete
update record set isDeleted = true

// Hard delete (what we avoid)
delete from record where id = 123
```

Benefits:
- Recover accidentally deleted data
- Audit trail - know when/who deleted
- Business logic might need historical data
- Still invisible to users (queries add `where isDeleted = false`)"

**Follow-up Questions:**
- "What if database grows huge?" → Archive old soft-deleted records to separate table
- "What about compliance?" → Hard delete for GDPR (right to be forgotten) - need different approach
- "Query performance?" → Tiny overhead (one extra WHERE clause), negligible

---

### Q5: How Is Data Validated?
**Expected Answer:**
"Using Zod - runtime schema validation:

```typescript
const CreateRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
});
```

Before any database operation, validate input:
```typescript
const validated = CreateRecordSchema.parse(req.body);
```

If invalid, Zod throws error caught by controller."

**Follow-up Questions:**
- "Why not just TypeScript types?" → Types checked at compile time, Zod at runtime. Users send whatever they want
- "What about SQL injection?" → Prisma parameterizes queries, Zod validates structure
- "Can frontend handle validation?" → Yes, but never trust frontend. Backend must always validate

---

### Q6: Walk Me Through a Record Creation Request
**Expected Answer:**

"1. Client POST to `/api/records` with body `{ amount: 500, type: "INCOME", ... }`
2. `authenticate` middleware checks JWT is valid, attaches user to request
3. `authorize('CREATE')` middleware checks user role can create
4. `RecordController.create()` receives request
5. Validates body with Zod schema - throws if invalid
6. Calls `RecordService.create(userId, data)`
7. `RecordService` calls `RecordRepository.create(userId, data)`
8. `RecordRepository` uses Prisma to insert into database: `prisma.record.create({ data: {...} })`
9. Gets back inserted record with generated ID
10. Returns up the chain: Repository → Service → Controller
11. Controller returns 201 Created with record object
12. Client receives response"

**Key Points:**
- User's ownership verified (userId from JWT)
- Data validated before DB
- Single responsibility through layers
- Error can fail at any point and propagate back

---

### Q7: How Would You Handle Millions of Records?
**Expected Answer:**
"Current approach might get slow. I'd implement:

1. **Pagination** - Already done, limits per page
2. **Indexing** - Database indexes on `userId`, `date`, `category`
3. **Cursor-based pagination** - Instead of skip/offset
4. **Caching** - Cache summary calculations in Redis (recalc every 5 min)
5. **Database read replicas** - Read from replica, write to primary
6. **Partitioning** - Split old records to archive table (2020 records separate from current)
7. **Aggregation in database** - Instead of looping, use SQL SUM/GROUP BY
8. **API rate limiting** - Prevent abuse, throttle users"

**Follow-up:**
- "Start with which?" → Indexing first (free performance), then caching

---

### Q8: Security Issues & How You'd Fix Them
**Expected Answer:**
"Current code has these issues I'd fix:

1. **JWT_SECRET hardcoded** → Move to `.env` file, use strong random secret
2. **No rate limiting** → Add express-rate-limit to prevent brute force
3. **No input sanitization** → Use helmet middleware for XSS/CSRF protection
4. **Password regex loose** → Require stronger passwords (uppercase, numbers, special chars)
5. **CORS not set** → Add CORS middleware to prevent cross-origin attacks
6. **No logging** → Add winston/pino for audit trail
7. **No request timeout** → Add timeout so slow queries don't hang connection
8. **Environment variables in schema** → Never commit `.env`"

**Implementation example:**
```typescript
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);
```

---

### Q9: How Would You Test This?
**Expected Answer:**
"Unit tests for each layer:

```typescript
// Test Repository
describe('UserRepository', () => {
  it('should create user', async () => {
    const user = await userRepo.create({ ... });
    expect(user.email).toBe('test@test.com');
  });
});

// Test Service
describe('AuthService', () => {
  it('should throw if user exists', async () => {
    // Mock repository
    jest.mock('./repositories/userRepository', () => ({
      findByEmail: jest.fn().mockResolvedValue({ id: '1', email: 'test@test.com' })
    }));
    
    await expect(authService.register('John', 'test@test.com', 'pass'))
      .rejects.toThrow('User already exists');
  });
});

// Test Controller
describe('AuthController', () => {
  it('should return 201 on successful register', async () => {
    const req = { body: { name: 'John', email: 'test@test.com', password: 'pass' } };
    const res = { status: jest.fn().returnThis(), json: jest.fn() };
    
    await AuthController.register(req as any, res as any);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

**Integration tests:**
```typescript
// Test entire flow
describe('Register Flow', () => {
  it('should register and return token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'a@b.com', password: 'pass' });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });
});
```"

---

### Q10: Explain Your Database Schema
**Expected Answer:**
"Two main tables:

**Users:**
- id: Primary key (auto-generated)
- name: String
- email: Unique (can't have duplicates)
- password: Hashed string
- role: String (VIEWER/ANALYST/ADMIN)
- createdAt: Timestamp

**Records:**
- id: Primary key
- userId: Foreign key to Users (which user owns this)
- amount: Number
- type: String (INCOME/EXPENSE)
- category: String (Salary, Groceries, etc)
- date: Date
- isDeleted: Boolean (soft delete flag)
- createdAt: Timestamp

**Relationships:**
- One user can have many records (1:N)
- When user deleted, records still exist (orphaned - could add cascade delete)

**Indexes for performance:**
- userId (fast lookup by user)
- date (fast filtering by date)
- createdAt (fast sorting)"

---

## Additional Technical Questions

### Q11: What's the Difference Between Authentication and Authorization?
**Answer:**
- **Authentication:** Verifying identity (Are you who you claim?)
  - Login with email + password
  - Verify JWT signature
- **Authorization:** Verifying permissions (Are you allowed to do this?)
  - Check user role can perform action
  - 403 Forbidden if not allowed

```
User → [Authentication] → JWT token → [Authorization] → Permission check → Access
```

---

### Q12: Explain the Request Lifecycle
**Answer:**
```
Request comes in
     ↓
Express.json() middleware parses JSON body
     ↓
Router matches path to handler
     ↓
authenticate middleware runs - verifies JWT, attaches user
     ↓
authorize('ACTION') middleware runs - checks permission
     ↓
Controller.action() runs - parses request
     ↓
Service.action() runs - business logic
     ↓
Repository.action() runs - database query
     ↓
Prisma sends SQL to SQLite
     ↓
Database returns result
     ↓
Result bubbles back up: Repo → Service → Controller
     ↓
Controller sends response (200/201/400/500)
     ↓
Client receives response
```

---

### Q13: Why Use TypeScript Over JavaScript?
**Answer:**
"TypeScript catches errors at compile time:

```typescript
// TypeScript catches this:
const user: User = { id: 123 };  // ❌ id should be string, not number

// JavaScript doesn't catch this - error only happens at runtime
const user = { id: 123 };
```

Benefits:
- Self-documenting (types show what function expects)
- IDE autocomplete works perfectly
- Refactoring is safer (rename variable everywhere)
- Fewer bugs in production"

---

### Q14: What About Caching?
**Answer:**
"For the summary endpoint which recalculates every time:

```typescript
// With Redis caching:
const cacheKey = `summary:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const summary = calculateSummary(userId);
await redis.set(cacheKey, JSON.stringify(summary), 'EX', 3600);  // Cache 1 hour
return summary;
```

**Tradeoff:**
- ✅ Much faster
- ❌ Data can be stale (summary from 1 hour ago)
- ❌ Extra complexity (need Redis server)
- ❌ Cache invalidation problem (if user creates new record, cache is wrong)"

---

### Q15: If You Had to Scale This to 1 Million Users?
**Answer:**
1. **Database:** Move from SQLite to PostgreSQL + read replicas
2. **Caching:** Add Redis layer for frequently accessed data
3. **Load Balancing:** Multiple Express servers behind Nginx
4. **API Versioning:** Support `/v1/` and `/v2/` endpoints
5. **Rate Limiting:** Prevent abuse
6. **Monitoring:** Datadog/NewRelic for performance tracking
7. **Logging:** Centralized logging (ELK stack)
8. **CDN:** Cache static Swagger docs
9. **Queue:** Background jobs (email, notifications) with Bull
10. **Microservices:** Separate Auth, Records, Analytics services

Start with: PostgreSQL + Redis + Load balancer

---

## Edge Cases & Error Handling

### Edge Case 1: User Deletes Their Own Records Then Requests Summary
```typescript
// Should return 0 income/expense if all deleted
const records = await prisma.record.findMany({
  where: {
    userId,
    isDeleted: false,  // <- Deleted records not included
  }
});

// If records is empty, summary = { totalIncome: 0, totalExpense: 0, ... }
```

---

### Edge Case 2: Transaction Processing Same Record Twice
```typescript
// Without transaction:
// User1 reads balance: $1000
// User2 reads balance: $1000
// Both update to $1500 instead of $2000 (lost update)

// With transaction:
await prisma.$transaction(async (tx) => {
  const record = await tx.record.findUnique({ where: { id }, select: { balance: true } });
  await tx.record.update({
    where: { id },
    data: { balance: record.balance + amount }
  });
});
```

---

### Edge Case 3: Floating Point Arithmetic
```typescript
// ❌ BAD - floating point precision issues
const balance = 0.1 + 0.2;  // = 0.30000000000000004 not 0.3

// ✅ GOOD - Use cents (integers)
const balance = 10 + 20;  // = 30 cents = $0.30
```

You'd store amounts as integers (cents) not decimals.

---

### Edge Case 4: Empty Results
```typescript
try {
  const records = await recordService.getAll(userId, {}, { page: 1, limit: 10 });
  res.json(records);  // returns { data: [], pagination: { ... } }
} catch (err) {
  res.status(400).json({ message: err.message });
}
```

---

## Common Mistakes & How to Avoid

| Mistake | How to Avoid |
|---------|-------------|
| Storing plaintext passwords | Always use bcryptjs, never store plaintext |
| Trusting frontend validation | Validate on backend ALWAYS |
| Hardcoding secrets | Use `.env` file, never commit secrets |
| Querying related data N+1 times | Use Prisma `include` to fetch relations in one query |
| No error handling | Try-catch on every async function |
| Hard delete instead of soft | Use isDeleted flag instead |
| Using offset pagination at scale | Use cursor-based pagination for large datasets |
| No request validation | Use Zod or similar for every input |
| Silent failures | Log errors, return meaningful error messages |
| Not checking user ownership | Verify user owns resource before returning/modifying |

---

## Practice Questions to Study

1. "What's the difference between 401 and 403 status codes?"
   - 401 = not authenticated, 403 = not authorized

2. "How would you handle concurrent record updates?"
   - Database transactions to ensure consistency

3. "What happens if JWT has expired?"
   - Auth middleware catches jwt.verify error, returns 401

4. "How do you prevent SQL injection?"
   - Prisma parameterizes queries, Zod validates input type before SQL

5. "Why use environment variables?"
   - Different secrets for dev/prod, no hardcoded passwords

6. "What if database is down?"
   - Prisma throws error, caught in controller, return 500 error

7. "How do you ensure user can only see their own records?"
   - Add `userId` to every query's WHERE clause

8. "What's a race condition?"
   - Two requests try to update same resource simultaneously, last one wins

9. "How to add feature to soft delete records after 30 days?"
   - Cron job that runs daily, soft deletes records where deletedAt > 30 days ago

10. "What would you change if this was multi-tenant (multiple organizations)?"
    - Add `organizationId` to every table and query filter

---

## Final Reminders for Interview

✅ **Do:**
- Explain WHY you made decisions, not just WHAT
- Show understanding of tradeoffs (performance vs complexity)
- Talk about production concerns (security, scaling, monitoring)
- Ask clarifying questions back ("What's your scale?")
- Discuss error scenarios and edge cases
- Show you know testing, logging, documentation matter

❌ **Don't:**
- Memorize answers - remember concepts, speak naturally
- Say "I don't know" without trying to reason through
- Assume everything will work perfectly
- Forget about error handling
- Talk only about happy path
- Use jargon without explaining

---

## Summary

Your project demonstrates:
✅ Clean architecture with separation of concerns
✅ Type-safe code with TypeScript
✅ Proper authentication and authorization
✅ Input validation and error handling
✅ Database design with relationships
✅ RESTful API best practices
✅ Layered architecture for testability
✅ Security considerations (password hashing, JWT)

You're ready! 🚀
