import { PrismaClient } from '@prisma/client';
import { ModelResponseType, ProjItem } from '../types';

class ProjModel {
  prisma: any;
  constructor() {
    this.prisma = new PrismaClient({});
  }
  async add(datas: ProjItem[]): Promise<ModelResponseType<ProjItem>> {
    try {
      const result = await this.prisma.project.createMany({
        data: datas,
        skipDuplicates: true // 插入重复数据时，不会报错
      });
      if (result) {
        return {
          status: true,
          msg: 'success'
        };
      }
      throw new Error(JSON.stringify(result));
    } catch (error) {
      return {
        status: false,
        msg: error.message || error
      };
    }
  }
  async count(query = {}): Promise<ModelResponseType<number>> {
    try {
      const result = await this.prisma.project.count({
        where: query
      });
      return {
        status: true,
        data: result,
        msg: 'success'
      };
    } catch (error) {
      return {
        status: false,
        msg: error.message || error
      };
    }
  }
  async find(pindex: number = 1, psize: number = 1, query = {}, order?): Promise<ModelResponseType<ProjItem[]>> {
    try {
      const skip = (pindex - 1) * Number(psize);
      let orderBy: any[] = [];
      if (order) {
        orderBy.push(order);
      }
      const result = await this.prisma.project.findMany({
        skip,
        take: Number(psize),
        where: query,
        orderBy
      });
      return {
        status: true,
        data: result,
        msg: 'success'
      };
    } catch (error) {
      return {
        status: false,
        data: [],
        msg: error.message || error
      };
    }
  }
}

export default ProjModel;
