import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLibraryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  address: string;
}
