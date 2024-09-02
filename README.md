# Obser website status

A Nestjs project for monitoring website status, automatically sending an email when a website is found offline

## Tech Stack

**Server:** Node, Nestjs

## Installation

Install dependencies

```bash
  npm install
```

Build source

```bash
  npm run build
```

Start monitoring

```bash
  npm run start
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file

- `MAIL_HOST`: SMTP host
- `MAIL_USER`: SMTP email
- `MAIL_APP_PASSWORD`: SMTP password or app password
- `MAIL_FROM`: Default sender email
- `MAIL_RECEIVER`: Receiver email. If you have more than one email, use a comma-delimited string.
- `CHECK_SITES`: Websites to monitor. If you have more than one website, use a comma-delimited string.
- `SCHEDULING_CHECK_STATUS`: Scheduling website status check. Using **Cron value**
- `SCHEDULING_PING_RESPORT`: Scheduling the sending of website ping reports. Using **Cron value**

For more information about Cron, refer to the [documentation](https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs).

## Environment Variables Example

```
MAIL_HOST=smtp.domain.com
MAIL_USER=smtpmail@domain.com
MAIL_APP_PASSWORD=topsecrect
MAIL_FROM=no-reply@example.com
MAIL_RECEIVER=receiver1@mail.com,receiver1@mail.com
CHECK_SITES=https://example.com,https://example2.com
SCHEDULING_CHECK_STATUS=*/30 * * * * *
SCHEDULING_PING_RESPORT=*/20 * * * * *
```

For more information about Cron, refer to the [documentation](https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs).
