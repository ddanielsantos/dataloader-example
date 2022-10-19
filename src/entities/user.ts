import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLFieldConfig,
  ThunkObjMap,
} from "graphql";
import { prisma } from "../data";
import DataLoader, { BatchLoadFn } from "dataloader";

const batchFn: BatchLoadFn<number, unknown> = async (keys) => {
  const promises = keys.map(
    (k) => prisma.$queryRaw`SELECT * FROM User WHERE id = ${k}`
  );
  const res = await Promise.allSettled(promises);
  return res.map((r) => (r.status === "rejected" ? null : r.value));
};

export const userDataloader = new DataLoader(batchFn);

export const User = new GraphQLObjectType({
  name: "User",
  fields: {
    id: {
      type: GraphQLID,
      resolve: (obj) => obj.id,
    },
    name: {
      type: GraphQLString,
      resolve: (obj) => obj.name,
    },
    email: {
      type: GraphQLString,
      resolve: (obj) => obj.email,
    },
  },
});

export const userQueries: ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {
  findAllUsers: {
    type: new GraphQLList(User),
    resolve: async () => await prisma.user.findMany(),
  },
  findByIdUser: {
    type: User,
    args: {
      id: {
        type: GraphQLInt,
      },
    },
    resolve: async (_, { id }) =>
      await prisma.user.findUnique({
        where: {
          id,
        },
      }),
  },
};

export const userMutations: ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {
  changeOneUser: {
    type: User,
    args: {
      id: {
        type: GraphQLInt,
      },
      name: {
        type: GraphQLString,
      },
    },
    resolve: async (_, { id, name }) => {
      const a = await prisma.user.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });

      userDataloader.clear(id);

      return a;
    },
  },
  addOneUser: {
    type: User,
    args: {
      name: {
        type: GraphQLString,
      },
      email: {
        type: GraphQLString,
      },
    },
    resolve: async (_, { email, name }) =>
      await prisma.user.create({
        data: {
          email,
          name,
        },
      }),
  },
};
