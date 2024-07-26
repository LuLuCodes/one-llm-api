import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as fs from 'fs';
import { resolve } from 'path';

@Module({
  imports: [],
  providers: [],
})
export class InitModule implements OnModuleInit {
  constructor() {}
  async onModuleInit(): Promise<void> {}
}
