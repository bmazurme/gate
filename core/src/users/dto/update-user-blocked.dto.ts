import { IsBoolean } from 'class-validator';

export class UpdateUserBlockedDto {
  @IsBoolean()
  isBlocked: boolean;
}
