import { Flags } from '@oclif/core';
import chalk from 'chalk';
import { config } from '../../_internal/config.js';
import { SequelizeCommand } from '../../_internal/sequelize-command.js';
import type { SupportedMigrationFormat } from '../../api/generate-migration.js';
import { SUPPORTED_MIGRATION_FORMATS, generateMigration } from '../../api/generate-migration.js';

export class GenerateMigration extends SequelizeCommand<(typeof GenerateMigration)['flags']> {
  static enableJsonFlag = true;

  static flags = {
    format: Flags.string({
      options: SUPPORTED_MIGRATION_FORMATS,
      summary: 'The format of the migration file to generate',
      required: true,
    }),
    name: Flags.string({
      summary: 'A short name for the migration file',
      default: 'unnamed',
    }),
    legacyTimestamp: Flags.boolean({
      summary: 'When enabled, use the legacy timestamp format from earlier versions of the CLI',
    }),
  };

  static summary = 'Generates a new migration file';

  static examples = [
    `<%= config.bin %> <%= command.id %>`,
    `<%= config.bin %> <%= command.id %> --format=sql`,
    `<%= config.bin %> <%= command.id %> --name="create users table"`,
    `<%= config.bin %> <%= command.id %> --legacyTimestamp`,
  ];

  async run(): Promise<{ path: string }> {
    const { format, name: migrationName, legacyTimestamp } = this.flags;
    const { migrationFolder } = config;

    const migrationPath = await generateMigration({
      format: format as SupportedMigrationFormat,
      migrationName,
      migrationFolder,
      legacyTimestamp,
    });

    if (format === 'sql') {
      this.log(`SQL migration files generated in ${chalk.green(migrationPath)}`);
    } else {
      this.log(`Migration file generated at ${chalk.green(migrationPath)}`);
    }

    // JSON output
    return { path: migrationPath };
  }
}
