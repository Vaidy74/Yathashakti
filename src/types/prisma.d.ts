import { PrismaClient as OriginalPrismaClient } from '@prisma/client';

declare global {
  // Extend the PrismaClient with our new models
  namespace PrismaClient {
    interface PrismaClient extends OriginalPrismaClient {
      notification: any;
      notificationSetting: any;
    }
  }
}

export {};
