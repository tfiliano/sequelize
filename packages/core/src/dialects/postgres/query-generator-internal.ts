import * as DataTypes from '../../data-types.js';
import { normalizeReference } from '../../model-definition.js';
import { generateEnumName, generateSequenceName } from '../../utils/format.js';
import { generateIndexName } from '../../utils/string.js';
import { attributeTypeToSql } from '../abstract/data-types-utils.js';
import { AbstractQueryGeneratorInternal } from '../abstract/query-generator-internal.js';
import type { NormalizedChangeColumnDefinition } from '../abstract/query-generator.types.js';
import type { TableNameWithSchema } from '../abstract/query-interface.js';
import type { PostgresQueryGenerator } from './query-generator.js';
import type { PostgresDialect } from './index.js';

export class PostgresQueryGeneratorInternal extends AbstractQueryGeneratorInternal {
  readonly #dialect: PostgresDialect;

  get #qg(): PostgresQueryGenerator {
    return this.#dialect.queryGenerator;
  }

  constructor(dialect: PostgresDialect) {
    super(dialect);

    this.#dialect = dialect;
  }

  attributeToChangeColumn(
    table: TableNameWithSchema,
    columnName: string,
    columnDefinition: NormalizedChangeColumnDefinition,
  ): string {
    const sql = [];

    const {
      type, allowNull, unique,
      autoIncrement, autoIncrementIdentity,
      defaultValue, dropDefaultValue,
      references, onUpdate, onDelete,
    } = columnDefinition;

    if (type != null) {
      let typeSql;
      if (
        columnDefinition.type instanceof DataTypes.ENUM
          || columnDefinition.type instanceof DataTypes.ARRAY && columnDefinition.type.options.type instanceof DataTypes.ENUM
      ) {
        const enumName = generateEnumName(table.tableName, columnName, { replacement: true });

        // cast enum to text to enum, because postgres won't let you cast from enum to enum
        typeSql = `${enumName} USING (${this.#qg.quoteIdentifier(columnName)}::text::${enumName})`;
      } else {
        typeSql = attributeTypeToSql(type);
      }

      sql.push(`ALTER COLUMN ${this.#qg.quoteIdentifier(columnName)} TYPE ${typeSql}`);
    }

    if (allowNull !== undefined) {
      sql.push(`ALTER COLUMN ${this.#qg.quoteIdentifier(columnName)} ${columnDefinition.allowNull ? 'DROP' : 'SET'} NOT NULL`);
    }

    if (defaultValue !== undefined) {
      sql.push(`ALTER COLUMN ${this.#qg.quoteIdentifier(columnName)} SET DEFAULT ${this.#qg.escape(columnDefinition.defaultValue)}`);
    }

    if (dropDefaultValue) {
      sql.push(`ALTER COLUMN ${this.#qg.quoteIdentifier(columnName)} DROP DEFAULT`);
    }

    if (autoIncrement !== undefined) {
      if (columnDefinition.autoIncrement) {
        // The sequence needs to be created, it is done as part of changeColumnsQuery
        sql.push(`ALTER COLUMN ${this.#qg.quoteIdentifier(columnName)} SET DEFAULT nextval(${this.#qg.escape(generateSequenceName(table.tableName, columnName))}::regclass)`);
      } else if (!('defaultValue' in columnDefinition)) {
        // we only drop this default if defaultValue is not specified, otherwise the defaultValue takes priority
        sql.push(`ALTER COLUMN ${this.#qg.quoteIdentifier(columnName)} DROP DEFAULT`);
      }
    }

    if (autoIncrementIdentity !== undefined) {
      if (columnDefinition.autoIncrementIdentity) {
        sql.push(`ALTER COLUMN ${this.#qg.quoteIdentifier(columnName)} ADD GENERATED BY DEFAULT AS IDENTITY`);
      } else {
        sql.push(`ALTER COLUMN ${this.#qg.quoteIdentifier(columnName)} DROP GENERATED BY DEFAULT`);
      }
    }

    // only 'true' is accepted for unique in changeColumns, because they're single column uniques.
    // more complex uniques use addIndex and removing a unique uses removeIndex
    if (unique === true) {
      const uniqueName = generateIndexName(table.tableName, {
        fields: [columnName],
        unique: true,
      });

      sql.push(`ADD CONSTRAINT ${this.#qg.quoteIdentifier(uniqueName)} UNIQUE (${this.#qg.quoteIdentifier(columnName)})`);
    }

    if (references !== undefined) {
      const normalizedReferences = normalizeReference(references)!;

      const targetTable = this.#qg.extractTableDetails(normalizedReferences.table);

      let fkSql = `ADD FOREIGN KEY (${this.#qg.quoteIdentifier(columnName)}) REFERENCES ${this.#qg.quoteTable(targetTable)}`;

      if (normalizedReferences.key) {
        fkSql += `(${this.#qg.quoteIdentifier(normalizedReferences.key)})`;
      }

      if (onUpdate) {
        fkSql += ` ON UPDATE ${onUpdate}`;
      }

      if (onDelete) {
        fkSql += ` ON DELETE ${onDelete}`;
      }

      if (normalizedReferences.deferrable) {
        fkSql += ` ${normalizedReferences.deferrable}`;
      }

      sql.push(fkSql);
    }

    return sql.join(', ');
  }
}