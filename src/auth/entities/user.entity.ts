import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type UserRole = 'client' | 'provider' | 'admin';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['client', 'provider', 'admin'],
    default: 'client',
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;
}
