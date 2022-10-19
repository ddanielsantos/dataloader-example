import {
  GraphQLObjectType,
  GraphQLSchema,
} from "graphql";
import { userMutations, userQueries } from "./entities/user";
import { postMutations, postQueries } from "./entities/post";

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: () => ({
      ...userQueries,
      ...postQueries
    }),
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: () => ({
      ...userMutations,
      ...postMutations
    }),
  }),
});
