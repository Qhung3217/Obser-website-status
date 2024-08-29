import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import WebsiteCheckerService from './website-checker.service';
import { SCHEDULING_CHECK_STATUS, SCHEDULING_PING_RESPORT } from './config';

@Injectable()
export default class TaskSchedulerService {
  private recipientEmail = process.env.MAIL_RECEIVER.split(',');
  // Array of websites to check
  private websites = process.env.CHECK_SITES.split(',').map((site) => ({
    url: site,
  }));

  constructor(private readonly websiteCheckerService: WebsiteCheckerService) {}

  // Runs every 5 minutes (using a cron expression)
  @Cron(SCHEDULING_CHECK_STATUS)
  async handleWebsiteCheck() {
    const offlineWebsites = [];

    for (const website of this.websites) {
      const { url } = website;
      const isOffline =
        await this.websiteCheckerService.checkWebsiteStatus(url);

      if (isOffline) {
        offlineWebsites.push({ url, error: isOffline });
      }
    }

    // If any websites are offline, send a single email with the details
    if (offlineWebsites.length > 0) {
      await this.websiteCheckerService.sendOfflineNotification(
        offlineWebsites,
        this.recipientEmail,
      );
    }
  }

  // Task to check website ping (latency check)
  @Cron(SCHEDULING_PING_RESPORT)
  async handleWebsitePingCheck() {
    const highLatencyWebsites = [];

    for (const website of this.websites) {
      const { url } = website;

      const pingResult = await this.websiteCheckerService.httpPingWebsite(url);

      // if (pingResult.time >= 100) {
      // Adjust the threshold for high latency in milliseconds
      highLatencyWebsites.push({
        url,
        time: pingResult.time,
        status: pingResult.status,
      });
      // }
    }

    // If any websites have high latency or are unreachable, send an email with the details
    if (highLatencyWebsites.length > 0) {
      await this.websiteCheckerService.sendPingNotification(
        highLatencyWebsites,
        this.recipientEmail,
      );
    }
  }
}
