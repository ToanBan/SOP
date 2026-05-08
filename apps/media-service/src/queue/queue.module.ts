import { Module } from '@nestjs/common';
import { QUEUE_PROVIDER } from './queue.provider';
import { connectionQueue } from '@repo/queue';
@Module({
  providers: [
    {
      provide: QUEUE_PROVIDER,
      useFactory: connectionQueue,
    },
  ],
  exports: [QUEUE_PROVIDER],
})
export class QueueModule {}