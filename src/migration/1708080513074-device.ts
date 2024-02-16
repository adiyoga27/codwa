import { MigrationInterface, QueryRunner } from "typeorm"

export class Device1708080513074 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            ` 
                --Table Definition
                CREATE TABLE "devices"  (
                  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                  "user_id" character varying NOT NULL,
                  "client_name" character varying NOT NULL,
                  "device_name" character varying NULL,
                  "device_phone" character varying NULL,
                  "device_status" character varying NULL,
                  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                  CONSTRAINT "PK_cace4a159ff9f2512dd42324" PRIMARY KEY ("id")
                )
    
                `
          ),
            undefined;
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "devices"`, undefined);

    }

}
