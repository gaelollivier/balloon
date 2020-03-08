import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

import { Context } from './context';
import { importFiles } from './import';

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: async (_, _args, ctx: Context) => {
          return importFiles(ctx);
        },
      },
    },
  }),
});
