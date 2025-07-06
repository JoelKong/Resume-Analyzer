import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1751782117606 implements MigrationInterface {
  name = 'InitialMigration1751782117606';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."resumes_status_enum" AS ENUM('UPLOADED', 'PROCESSED', 'INVALID')`,
    );
    await queryRunner.query(
      `CREATE TABLE "resumes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileName" character varying NOT NULL, "jobUrl" character varying NOT NULL, "status" "public"."resumes_status_enum" NOT NULL DEFAULT 'UPLOADED', "insights" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c8677802096d6baece48429d2e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "resumes"`);
    await queryRunner.query(`DROP TYPE "public"."resumes_status_enum"`);
  }
}
