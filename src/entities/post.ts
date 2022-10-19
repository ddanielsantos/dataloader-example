import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
  GraphQLFieldConfig,
  ThunkObjMap,
} from "graphql";
import { prisma } from "../data";
import { User, userDataloader } from "./user";

export const Post = new GraphQLObjectType({
  name: "Post",
  fields: {
    id: {
      type: GraphQLID,
      resolve: (obj) => obj.id,
    },
    title: {
      type: GraphQLString,
      resolve: (obj) => obj.title,
    },
    content: {
      type: GraphQLString,
      resolve: (obj) => obj.content,
    },
    authorId: {
      type: GraphQLString,
      resolve: (obj) => obj.authorId,
    },
    author: {
      type: User,
      resolve: async (obj) => {
        /**
         * first example:
         *  showing how a non batched query performs
         */
        // const a =
        //   await prisma.$queryRaw`SELECT * FROM User WHERE id = ${obj.authorId}`;
        // return a ? a[0] : null;

        /**
         * seconde example:
         *  showing how to batch a query
         */
        const a = await userDataloader.load(obj.authorId);

        return a ? a[0] : null;

        /**
         * extra example:
         *  prisma automatic batching
         */
        // const a = await prisma.user.findUnique({
        //   where: {
        //     id: obj.authorId,
        //   },
        // });
        // return a;
      },
    },
    published: {
      type: GraphQLBoolean,
      resolve: (obj) => obj.published,
    },
  },
});

export const postQueries: ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {
  getPosts: {
    type: new GraphQLList(Post),
    resolve: async () => await prisma.post.findMany(),
  },
  findByIdPost: {
    type: Post,
    args: {
      id: {
        type: GraphQLInt,
      },
    },
    resolve: async (_, { id }) =>
      await prisma.post.findUnique({
        where: {
          id,
        },
      }),
  },
};

export const postMutations: ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {
  addOnePost: {
    type: Post,
    args: {
      title: {
        type: GraphQLString,
      },
      content: {
        type: GraphQLString,
      },
      authorId: {
        type: GraphQLInt,
      },
      published: {
        type: GraphQLBoolean,
      },
    },
    resolve: async (_, { title, content, authorId, published }) =>
      await prisma.post.create({
        data: {
          title,
          content,
          authorId,
          published,
        },
      }),
  },
};
