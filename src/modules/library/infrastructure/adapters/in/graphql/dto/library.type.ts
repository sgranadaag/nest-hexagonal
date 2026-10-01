import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Library } from '@modules/library/domain/entities/library.entity';

@ObjectType('Library')
export class LibraryType {
  @Field(() => ID)
  readonly id: string;

  @Field()
  readonly name: string;

  @Field()
  readonly address: string;

  private constructor(id: string, name: string, address: string) {
    this.id = id;
    this.name = name;
    this.address = address;
  }

  static fromDomain(library: Library): LibraryType {
    return new LibraryType(
      library.getId().get(),
      library.getName(),
      library.getAddress().get(),
    );
  }
}
