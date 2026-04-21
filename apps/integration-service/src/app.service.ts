import { Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provider';
@Injectable()
export class AppService {
  constructor(@Inject(DB_PROVIDER) private db: any) {}
  async getHello() {
    try {
      const result = await this.db.execute('SELECT 1');
      return {
        message: 'DB OK ✅',
        result,
      };
    } catch (err) {
      return {
        message: 'DB FAIL ❌',
      };
    }
  }
}
