import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';

import { Permission } from './permission.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('user_permissions_override')
export class UserPermissionsOverride {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.overrides)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Permission, (permission) => permission.overrides)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({ type: 'boolean' })
  isGranted: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
