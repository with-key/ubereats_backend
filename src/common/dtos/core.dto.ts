import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreOutput {
  @Field((_) => String, { nullable: true })
  error?: string;

  @Field((_) => Boolean)
  ok: boolean;
}
