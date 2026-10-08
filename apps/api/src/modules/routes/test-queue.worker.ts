import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('test-queue')
export class TestQueueWorker extends WorkerHost {
  async process(job: Job<{ message: string }>): Promise<void> {
    console.log(
      `Processing job ${job.id} with data ${JSON.stringify(job.data)}`,
    );
    const totalSteps = 5;

    for (let step = 0; step < totalSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const progres = Math.round((step / totalSteps) * 100);

      await job.updateProgress(progres);
    }
  }

  @OnWorkerEvent('active')
  onAdded(job: Job<{ message: string }>): void {
    console.log(`Job ${job.id} added to the queue`);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<{ message: string }>): void {
    console.log(`Job ${job.id} progress: ${job.progress} %`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<{ message: string }>): void {
    console.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<{ message: string }>): void {
    console.log(
      `Job ${job.id} failed: ${job.failedReason}, attempts: ${job.attemptsMade}`,
    );
  }
}
