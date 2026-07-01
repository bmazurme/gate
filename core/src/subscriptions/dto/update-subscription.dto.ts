import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;
}
