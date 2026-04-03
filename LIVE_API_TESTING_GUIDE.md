# 🎉 LIVE API TESTING GUIDE

## 🌍 YOUR LIVE API IS READY!

```
🟢 Status: LIVE
🌍 URL: https://finance-flow-zvzq.onrender.com
📚 Swagger: https://finance-flow-zvzq.onrender.com/api-docs
```

---

## ⚡ QUICKEST TEST (30 seconds)

### 1. Open Swagger UI in Browser
```
https://finance-flow-zvzq.onrender.com/api-docs
```

You'll see all endpoints with docs. Click any endpoint and click **"Try it out"** to test!

---

## 🧪 MANUAL TESTING (with curl)

### Test 1: Health Check
```bash
curl https://finance-flow-zvzq.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-04-03T04:50:00.000Z"
}
```

---

### Test 2: Register User
```bash
curl -X POST https://finance-flow-zvzq.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "cmnif8xz60000fu0xeanrxnbb",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "VIEWER",
    "status": "ACTIVE",
    "createdAt": "2026-04-03T04:50:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token!** You'll need it for other requests.

---

### Test 3: Login
```bash
curl -X POST https://finance-flow-zvzq.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
Same as registration - user object + JWT token

---

### Test 4: Try to Create Record (Should Fail - VIEWER Role)
```bash
TOKEN="<your-token-from-step-2>"

curl -X POST https://finance-flow-zvzq.onrender.com/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 5000,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-03T00:00:00Z",
    "notes": "Monthly salary"
  }'
```

**Expected Response (403):**
```json
{
  "message": "Access denied for VIEWER"
}
```

✅ This proves **access control is working!** VIEWER can't create records.

---

### Test 5: Get Records (VIEWER Can View)
```bash
TOKEN="<your-token-from-step-2>"

curl -X GET "https://finance-flow-zvzq.onrender.com/api/records?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

✅ Returns empty (no records yet for this user)

---

### Test 6: Get Dashboard Summary (Empty)
```bash
TOKEN="<your-token-from-step-2>"

curl -X GET https://finance-flow-zvzq.onrender.com/api/records/summary \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "totalIncome": 0,
  "totalExpense": 0,
  "netBalance": 0,
  "categoryBreakdown": {},
  "recentActivity": []
}
```

---

## ✅ WHAT THIS PROVES

| Test | Result | What It Shows |
|------|--------|---------------|
| Health Check | ✅ Works | API is running |
| Register | ✅ Creates user | Authentication works |
| Login | ✅ Returns token | JWT generation works |
| Access Denied | ✅ 403 Forbidden | RBAC working (VIEWER can't create) |
| Get Records | ✅ Returns empty list | Authorization middleware working |
| Summary | ✅ Returns totals | Analytics endpoint working |

---

## 🎯 WHAT YOU CAN SAY TO RECRUITER

> "This is my **live Finance backend API** deployed on Render.com. 
> 
> You can:
> - Test all endpoints at the **Swagger UI link** (no Postman needed)
> - See the complete documentation with request/response schemas
> - Try the API directly in your browser
> 
> The system demonstrates:
> ✅ Clean layered architecture (Route → Controller → Service → Repository)
> ✅ JWT-based authentication
> ✅ Role-based access control (VIEWER/ANALYST/ADMIN)
> ✅ Financial data management with pagination and filtering
> ✅ Dashboard analytics (income, expense, balance, category breakdown)
> ✅ Soft delete for audit trails
> ✅ Input validation with Zod
> ✅ TypeScript for type safety
>
> The API is production-ready with graceful error handling and logging."

---

## 📊 ARCHITECTURE HIGHLIGHTS

```
Your API:
├── 🌐 Live on Render.com
├── 📚 Interactive Swagger documentation
├── 🔐 JWT authentication
├── 👥 Role-based access control (3 roles)
├── 💾 SQLite with Prisma ORM
├── ✅ Input validation (Zod)
├── 📈 Analytics endpoints
└── 🎯 Clean layered design
```

---

## 🚀 NEXT STEPS FOR INTERVIEW

### Coming up:
1. **Interview Preparation** - Answer common backend questions
2. **Architecture Deep Dive** - Explain design choices
3. **Scaling Discussion** - How to handle growth

### Questions You'll Be Ready For:
- "Why this architecture?" → Layered separation of concerns
- "How's access control implemented?" → Middleware checking user role
- "How would you scale?" → DB optimization, caching, microservices
- "Tell me about error handling" → Validation + middleware + graceful shutdown
- "What about deployment?" → Show the live API!

**Your live API is your strongest asset. Use it!** 💪

---

## 📝 IMPORTANT LINKS

- **Live API:** https://finance-flow-zvzq.onrender.com
- **Swagger Docs:** https://finance-flow-zvzq.onrender.com/api-docs
- **GitHub Repo:** https://github.com/R0HIT-45/Finance-Flow
- **Render Dashboard:** https://dashboard.render.com

---

**👉 Go to the Swagger link and test endpoints to verify everything works!**
