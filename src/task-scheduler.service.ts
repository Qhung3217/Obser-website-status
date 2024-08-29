import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import WebsiteCheckerService from './website-checker.service';

@Injectable()
export default class TaskSchedulerService {
  constructor(private readonly websiteCheckerService: WebsiteCheckerService) {}

  // Runs every 5 minutes (using a cron expression)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleWebsiteCheck() {
    const websiteUrl = 'https://example.comxx'; // Replace with the website you want to check
    const recipientEmail = 'gamegomstv@gmail.com';
    await this.websiteCheckerService.checkWebsiteStatus(
      websiteUrl,
      recipientEmail,
    );
  }
}
