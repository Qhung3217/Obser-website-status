import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import WebsiteCheckerService from './website-checker.service';
import TaskSchedulerService from './task-scheduler.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST, // Replace with your SMTP host
        port: 587,
        secure: false, // true for 465, false for other ports

        auth: {
          user: process.env.MAIL_USER, // Replace with your SMTP email
          pass: process.env.MAIL_APP_PASSWORD, // Replace with your SMTP password
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM}>`, // Default sender email
      },
      template: {
        dir: join(__dirname, 'templates'), // Optional: email templates directory
        adapter: new HandlebarsAdapter(), // Optional: for using templates
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TaskSchedulerService, WebsiteCheckerService],
})
export class AppModule {}
