import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "devices" })
export class Device {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  user_id: string;

  @Column({ nullable: false })
  client_name: string;

  @Column({ nullable: true })
  device_name: string;

  @Column({ nullable: true })
  device_phone: string;

  @Column({ default: "DISCONNECTED" })
  device_status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
