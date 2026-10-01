import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

@InputType()
export class CreateAuthorInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  booksAccount: number;
}
