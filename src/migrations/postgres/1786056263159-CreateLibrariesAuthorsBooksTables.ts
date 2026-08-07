import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLibrariesAuthorsBooksTables1786056263159 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "libraries" (
        "id" uuid PRIMARY KEY,
        "name" varchar NOT NULL,
        "address" varchar NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "authors" (
        "id" uuid PRIMARY KEY,
        "name" varchar NOT NULL,
        "booksAccount" integer NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "books" (
        "id" uuid PRIMARY KEY,
        "title" varchar NOT NULL,
        "description" varchar NOT NULL,
        "authorId" uuid NOT NULL REFERENCES "authors"("id"),
        "libraryId" uuid NOT NULL REFERENCES "libraries"("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(`DROP TABLE "authors"`);
    await queryRunner.query(`DROP TABLE "libraries"`);
  }
}
