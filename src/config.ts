import { CronExpression } from '@nestjs/schedule';

export const SCHEDULING_CHECK_STATUS = CronExpression.EVERY_HOUR;
export const SCHEDULING_PING_RESPORT = CronExpression.EVERY_DAY_AT_8AM;
