import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  description: string;

  @IsUUID()
  authorId: string;

  @IsUUID()
  libraryId: string;
}
