import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export default class WebsiteCheckerService {
  private readonly logger = new Logger(WebsiteCheckerService.name);
  // Array of websites to check

  constructor(
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
  ) {}

  async checkWebsiteStatus(url: string, recipientEmail: string): Promise<void> {
    this.httpService
      .get(url)
      .pipe(
        map(() => {
          this.logger.log(`Website ${url} is online`);
        }),
        catchError((error) => {
          this.logger.error(
            `Website ${url} is offline. Error: ${error.message}`,
          );
          // Send email notification
          this.sendOfflineNotification(url, error.message, recipientEmail);
          return of(null);
        }),
      )
      .subscribe();
  }
  private async sendOfflineNotification(
    url: string,
    errorMessage: string,
    recipientEmail: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: `Website Offline: ${url}`,
        template: './offline-notification', // Optionally use a template
        context: {
          // Data to be passed to the template
          url: url,
          errorMessage: errorMessage,
        },
        text: `The website ${url} appears to be offline. Error: ${errorMessage}`,
      });
      this.logger.log(`Offline notification sent to ${recipientEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send offline notification: ${error.message}`,
      );
    }
  }
}
