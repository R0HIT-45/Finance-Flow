import { Request, Response } from 'express';
import { RecordService } from '../services/recordService';
import { PaginationSchema, CreateRecordSchema, UpdateRecordSchema } from '../validators/schemas';

const service = new RecordService();

export class RecordController {

  static async create(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const validatedData = CreateRecordSchema.parse(req.body);
      const result = await service.create(userId, validatedData);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ message: 'Validation failed', errors: err.errors });
      }
      res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async getAll(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const pagination = PaginationSchema.parse(req.query);
      const result = await service.getAll(userId, pagination, {
        page: pagination.page,
        limit: pagination.limit,
      });
      res.json(result);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ message: 'Validation failed', errors: err.errors });
      }
      res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const validatedData = UpdateRecordSchema.parse(req.body);
      const result = await service.update(userId, req.params.id, validatedData);
      res.json(result);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ message: 'Validation failed', errors: err.errors });
      }
      if (err.message === 'Record not found') {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async summary(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const result = await service.getSummary(userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const userId = req.user.id;
      await service.delete(userId, req.params.id);
      res.status(204).send();
    } catch (err: any) {
      if (err.message === 'Record not found') {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }
}