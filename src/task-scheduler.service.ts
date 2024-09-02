import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import WebsiteCheckerService from './website-checker.service';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
@Injectable()
export default class TaskSchedulerService {
  private recipientEmail = process.env.MAIL_RECEIVER.split(',');

  // Array of websites to check
  private websites = process.env.CHECK_SITES.split(',').map((site) => ({
    url: site,
  }));

  private SCHEDULING_CHECK_STATUS;
  private SCHEDULING_PING_RESPORT;

  constructor(
    private readonly websiteCheckerService: WebsiteCheckerService,
    private configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.SCHEDULING_CHECK_STATUS =
      this.configService.get<string>('SCHEDULING_CHECK_STATUS') ||
      '*/10 * * * * *';
    this.SCHEDULING_PING_RESPORT =
      this.configService.get<string>('SCHEDULING_PING_RESPORT') ||
      '*/10 * * * * *';
  }
  onModuleInit() {
    this.scheduleWebsiteCheck();
    this.schedulePingCheck();
  }
  private scheduleWebsiteCheck() {
    const job = new CronJob(this.SCHEDULING_CHECK_STATUS, async () => {
      await this.handleWebsiteCheck();
    });

    this.schedulerRegistry.addCronJob('website-check-job', job);
    job.start();
  }
  private schedulePingCheck() {
    const job = new CronJob(this.SCHEDULING_PING_RESPORT, async () => {
      await this.handleWebsitePingCheck();
    });

    this.schedulerRegistry.addCronJob('ping-check-job', job);
    job.start();
  }
  // @Cron(this.SCHEDULING_CHECK_STATUS)
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
  // @Cron(this.SCHEDULING_PING_RESPORT)
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

    if (highLatencyWebsites.length > 0) {
      await this.websiteCheckerService.sendPingNotification(
        highLatencyWebsites,
        this.recipientEmail,
      );
    }
  }
}
