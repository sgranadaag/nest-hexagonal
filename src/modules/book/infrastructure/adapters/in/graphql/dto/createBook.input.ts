import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class CreateBookInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  description: string;

  @Field(() => ID)
  @IsUUID()
  authorId: string;

  @Field(() => ID)
  @IsUUID()
  libraryId: string;
}
