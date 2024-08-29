import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom, lastValueFrom, of } from 'rxjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export default class WebsiteCheckerService {
  private readonly statusLogger = new Logger('STATUS');
  private readonly pingLogger = new Logger('PING');
  private readonly mailLogger = new Logger('MAIL_SEND');

  constructor(
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
  ) {}

  async checkWebsiteStatus(url: string): Promise<string | null> {
    return lastValueFrom(
      this.httpService
        .get(url, {
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false, // Bypass SSL certificate validation
          }),
        })
        .pipe(
          map(() => {
            this.statusLogger.log(`Website ${url} is online`);
            return null;
          }),
          catchError((error) => {
            this.statusLogger.error(
              `Website ${url} is offline. Error: ${error.message}`,
            );

            return of(error.message);
          }),
        ),
    );
  }
  async sendOfflineNotification(
    websites: { url: string; error: string }[],
    recipientEmail: string | string[],
  ) {
    try {
      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: `Website Offline`,
        template: './offline-notification', // Optionally use a template
        context: {
          // Data to be passed to the template
          websites,
        },
      });
      this.mailLogger.log(`Offline notification sent to ${recipientEmail}`);
    } catch (error) {
      this.mailLogger.error(
        `Failed to send offline notification: ${error.message}`,
      );
    }
  }

  // Send a single email notification with the ping report
  async sendPingNotification(
    websites: { url: string; time: number; status: boolean }[],
    recipientEmail: string | string[],
  ) {
    try {
      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: 'Website Ping Report',
        template: './ping-report', // Handlebars template for ping report
        context: {
          websites, // Pass the list of websites with high latency or unreachable status to the template
        },
      });
      this.mailLogger.log(`Ping notification sent to ${recipientEmail}`);
    } catch (error) {
      this.mailLogger.error(
        `Failed to send ping notification: ${error.message}`,
      );
    }
  }

  // "Ping" a website using HttpService and measure the response time
  async httpPingWebsite(
    url: string,
  ): Promise<{ time: number; status: boolean }> {
    const startTime = Date.now();

    try {
      this.pingLogger.log(`Website ${url} is ping`);

      await firstValueFrom(
        this.httpService
          .get(url, {
            httpsAgent: new (require('https').Agent)({
              rejectUnauthorized: false, // Bypass SSL certificate validation
            }),
          })
          .pipe(
            catchError((error) => {
              this.pingLogger.error(
                `Website ${url} is offline. Error: ${error.message}`,
              );
              return [];
            }),
          ),
      );
      const latency = Date.now() - startTime;
      return { time: latency, status: true }; // Website is online, return latency
    } catch (error) {
      const latency = Date.now() - startTime;
      return { time: latency, status: false }; // Website is offline or request failed
    }
  }
}
