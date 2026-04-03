import { Router } from 'express';
import { RecordController } from '../controllers/recordController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a new financial record
 *     description: Add a new income or expense record. Only ADMIN users can create records.
 *     tags:
 *       - Records
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 example: INCOME
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-04-03T00:00:00Z
 *               notes:
 *                 type: string
 *                 example: Monthly salary
 *     responses:
 *       201:
 *         description: Record successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied - insufficient permissions
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.post('/', authorize('CREATE'), RecordController.create);

/**
 * @swagger
 * /api/records/summary:
 *   get:
 *     summary: Get financial summary and analytics
 *     description: Retrieve dashboard analytics including total income, expenses, net balance, category breakdown, and recent activity. Available to all authenticated users.
 *     tags:
 *       - Dashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                   example: 5300
 *                 totalExpense:
 *                   type: number
 *                   example: 1250
 *                 netBalance:
 *                   type: number
 *                   example: 4050
 *                 categoryBreakdown:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                   example:
 *                     Salary: 5000
 *                     Freelance: 300
 *                     Rent: 1200
 *                     Food: 50
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get('/summary', authorize('READ'), RecordController.summary);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get all financial records
 *     description: Retrieve paginated list of financial records with optional filtering. All authenticated users can view their own records.
 *     tags:
 *       - Records
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of records per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter by record type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *     responses:
 *       200:
 *         description: List of records with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get('/', authorize('READ'), RecordController.getAll);

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update a financial record
 *     description: Modify an existing record. Only the record owner and ADMIN users can update records.
 *     tags:
 *       - Records
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Record not found
 *       403:
 *         description: Access denied - insufficient permissions
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.put('/:id', authorize('UPDATE'), RecordController.update);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     description: Soft delete a record (marks as deleted but keeps in database for audit trail). Only the record owner and ADMIN users can delete records.
 *     summary: Delete a financial record
 *     tags:
 *       - Records
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID to delete
 *     responses:
 *       204:
 *         description: Record successfully deleted
 *       404:
 *         description: Record not found
 *       403:
 *         description: Access denied - insufficient permissions
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.delete('/:id', authorize('DELETE'), RecordController.delete);

export default router;