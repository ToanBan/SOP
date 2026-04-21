import { Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provide';

@Injectable()
export class AppService {
  constructor(@Inject(DB_PROVIDER) private readonly db: any) {}

  async getHello(): Promise<string> {
    try {
      await this.db.execute('SELECT 1');

      return 'Database connected successfully! ';
    } catch (error) {
      console.error('DB connection failed:', error);

      return 'Database connection failed ';
    }
  }
}