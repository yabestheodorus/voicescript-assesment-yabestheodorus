import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CommonModule } from './common/common.module';
import { ReportersModule } from './reporters/reporters.module';
import { EditorsModule } from './editors/editors.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    ReportersModule,
    EditorsModule,
    JobsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
