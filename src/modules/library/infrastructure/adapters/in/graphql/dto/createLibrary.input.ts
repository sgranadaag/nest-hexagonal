import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateLibraryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  address: string;
}
