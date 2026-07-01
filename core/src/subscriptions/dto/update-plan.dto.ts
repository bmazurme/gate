import { IsNumber, Min } from 'class-validator';

export class UpdatePlanDto {
  @IsNumber()
  @Min(0.01)
  price: number;
}
