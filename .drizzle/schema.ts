import {
  mysqlTable,
  primaryKey,
  int,
  datetime,
  varchar,
  json,
  boolean,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const property = mysqlTable(
  'Property',
  {
    id: int('id').autoincrement().notNull(),
    createdAt: datetime('createdAt', { mode: 'string', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: datetime('updatedAt', { mode: 'string', fsp: 3 }).notNull(),
    createdBy: varchar('createdBy', { length: 255 }).notNull(),
    imageUrls: json('imageUrls').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    price: int('price').notNull(),
    numberOfBeds: int('numberOfBeds').notNull(),
    numberOfBaths: int('numberOfBaths').notNull(),
    sqft: int('sqft').notNull(),
    propertyType: varchar('propertyType', { length: 255 }).notNull(),
    isFeatured: boolean('isFeatured').default(false).notNull(),
    isActive: boolean('isActive').default(true).notNull(),
    isSold: boolean('isSold').default(false).notNull(),
  },
  (table) => {
    return {
      propertyId: primaryKey(table.id),
    };
  },
);
