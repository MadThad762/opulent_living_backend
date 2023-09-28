import {
  mysqlTable,
  primaryKey,
  int,
  varchar,
  boolean,
  timestamp,
} from 'drizzle-orm/mysql-core';

export const property = mysqlTable(
  'Property',
  {
    id: int('id').autoincrement().notNull(),
    createdAt: timestamp('createdAt', { mode: 'string', fsp: 3 }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'string', fsp: 3 }).defaultNow(),
    createdBy: varchar('createdBy', { length: 255 }).notNull(),
    imagePublicId: varchar('imagePublicId', { length: 255 }).notNull(),
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
