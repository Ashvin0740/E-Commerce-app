import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString({ message: 'Only string value allowed' })
  name: string;

  @IsNotEmpty()
  @IsString({ message: 'Only string value allowed' })
  description: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Only number value allowed' })
  price: number;
}
