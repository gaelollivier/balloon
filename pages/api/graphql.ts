import { ApolloServer } from 'apollo-server-micro';
import { google } from 'googleapis';
import { NextApiRequest } from 'next';

import { Context, schema } from '../../graphql/schema';
import { getGoogleDriveClient } from '../../utils/drive';
import { getHasuraClient } from '../../utils/hasura';

const apolloServer = new ApolloServer({
  schema,
  context: ({ req }: { req: NextApiRequest }): Context => {
    return {
      hasura: getHasuraClient(req),
      drive: getGoogleDriveClient(req),
    };
  },
});

const handler = apolloServer.createHandler({ path: '/api/graphql' });

export const config = { api: { bodyParser: false } };

export default handler;
