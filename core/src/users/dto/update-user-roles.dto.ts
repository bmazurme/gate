import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { Role } from '../../roles/enums/role.enum';

export class UpdateUserRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
