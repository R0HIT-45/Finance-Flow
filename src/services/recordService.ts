import { RecordRepository } from '../repositories/recordRepository';

const recordRepo = new RecordRepository();

export class RecordService {

  async create(userId: string, data: any) {
    return recordRepo.create(userId, data);
  }

  async getAll(userId: string, filters: any, pagination?: any) {
    return recordRepo.findAll(userId, filters, pagination);
  }
  async getSummary(userId: string) {
    const summary = await recordRepo.getSummary(userId);
    const result = await recordRepo.findAll(userId, {}, undefined);

    const recentActivity = Array.isArray(result) ? result.slice(0, 5) : [];

    return {
      ...summary,
      recentActivity
    };
  }
  async update(userId: string, id: string, data: any) {
    const record = await recordRepo.findById(id);

    if (!record || record.userId !== userId) {
      throw new Error('Record not found');
    }

    return recordRepo.update(id, data);
  }

  async delete(userId: string, id: string) {
    const record = await recordRepo.findById(id);

    if (!record || record.userId !== userId) {
      throw new Error('Record not found');
    }

    return recordRepo.softDelete(id);
  }
}