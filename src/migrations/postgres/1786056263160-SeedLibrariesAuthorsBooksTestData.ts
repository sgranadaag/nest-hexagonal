import { MigrationInterface, QueryRunner } from 'typeorm';

const LIBRARY_1_ID = '11111111-1111-1111-1111-111111111111';
const LIBRARY_2_ID = '22222222-2222-2222-2222-222222222222';
const AUTHOR_1_ID = '33333333-3333-3333-3333-333333333333';
const AUTHOR_2_ID = '44444444-4444-4444-4444-444444444444';
const BOOK_1_ID = '55555555-5555-5555-5555-555555555555';
const BOOK_2_ID = '66666666-6666-6666-6666-666666666666';
const BOOK_3_ID = '77777777-7777-7777-7777-777777777777';

export class SeedLibrariesAuthorsBooksTestData1786056263160 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "libraries" ("id", "name", "address") VALUES
      ('${LIBRARY_1_ID}', 'Central Library', '123 Main St'),
      ('${LIBRARY_2_ID}', 'Uptown Library', '456 Oak Ave')
    `);

    await queryRunner.query(`
      INSERT INTO "authors" ("id", "name", "booksAccount") VALUES
      ('${AUTHOR_1_ID}', 'Jane Doe', 2),
      ('${AUTHOR_2_ID}', 'John Smith', 1)
    `);

    await queryRunner.query(`
      INSERT INTO "books" ("id", "title", "description", "authorId", "libraryId") VALUES
      ('${BOOK_1_ID}', 'Domain-Driven Design', 'Tackling complexity in the heart of software', '${AUTHOR_1_ID}', '${LIBRARY_1_ID}'),
      ('${BOOK_2_ID}', 'Clean Architecture', 'A craftsman''s guide to software structure', '${AUTHOR_1_ID}', '${LIBRARY_1_ID}'),
      ('${BOOK_3_ID}', 'Patterns of Enterprise Application Architecture', 'A catalog of patterns for enterprise software', '${AUTHOR_2_ID}', '${LIBRARY_2_ID}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "books" WHERE "id" IN ('${BOOK_1_ID}', '${BOOK_2_ID}', '${BOOK_3_ID}')`,
    );
    await queryRunner.query(
      `DELETE FROM "authors" WHERE "id" IN ('${AUTHOR_1_ID}', '${AUTHOR_2_ID}')`,
    );
    await queryRunner.query(
      `DELETE FROM "libraries" WHERE "id" IN ('${LIBRARY_1_ID}', '${LIBRARY_2_ID}')`,
    );
  }
}
