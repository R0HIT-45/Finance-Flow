import { prisma } from '../config/database';

export class RecordRepository {

  async create(userId: string, data: any) {
    return prisma.record.create({
      data: {
        ...data,
        userId
      }
    });
  }
  async getSummary(userId: string) {
  const records = await prisma.record.findMany({
    where: { userId, isDeleted: false }
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap: any = {};

  for (const r of records) {
    if (r.type === 'INCOME') totalIncome += r.amount;
    else totalExpense += r.amount;

    // category breakdown
    if (!categoryMap[r.category]) {
      categoryMap[r.category] = 0;
    }
    categoryMap[r.category] += r.amount;
  }

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    categoryBreakdown: categoryMap
  };
    }
  async findAll(userId: string, filters: any, pagination?: any) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where: {
          userId,
          isDeleted: false,
          ...(filters.type && { type: filters.type }),
          ...(filters.category && { category: filters.category }),
        },
        orderBy: { date: 'desc' },
        skip: pagination ? skip : undefined,
        take: pagination ? limit : undefined,
      }),
      prisma.record.count({
        where: {
          userId,
          isDeleted: false,
          ...(filters.type && { type: filters.type }),
          ...(filters.category && { category: filters.category }),
        },
      }),
    ]);

    if (pagination) {
      return {
        data: records,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }

    return records;
  }

  async findById(id: string) {
    return prisma.record.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.record.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string) {
    return prisma.record.update({
      where: { id },
      data: { isDeleted: true }
    });
  }
}
