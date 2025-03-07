/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PrismaClient } from '@prisma/client';
import { AppConfig } from '@/lib/appConfig';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = AppConfig.IS_PRODUCTION
  ? new PrismaClient()
  : global.prisma ?? (global.prisma = new PrismaClient());

export default prisma;