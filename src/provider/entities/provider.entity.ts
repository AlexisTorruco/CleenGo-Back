// src/provider/entities/provider.entity.ts
import { ChildEntity, Column } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@ChildEntity()
export class Provider extends User {
  @Column('text', { array: true, nullable: true })
  days: string[];

  @Column('text', { array: true, nullable: true })
  hours: string[];

  @Column({ type: 'text', nullable: true })
  about: string;
}
