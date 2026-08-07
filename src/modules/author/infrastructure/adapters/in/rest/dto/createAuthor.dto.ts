import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  booksAccount: number;
}
