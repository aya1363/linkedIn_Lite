// src/graphql/test.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class TestResolver {
  @Query(() => String)
  test() {
    return 'GraphQL works 🚀';
  }
}
