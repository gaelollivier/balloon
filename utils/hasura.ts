import { ASTNode, print as printQuery } from 'graphql';
import { NextApiRequest } from 'next';
import fetch from 'node-fetch';

export type HasuraClient = (args: {
  query: ASTNode;
  variables?: any;
}) => Promise<{ data: any }>;

export const getHasuraClient = (req: NextApiRequest): HasuraClient => {
  return ({ query, variables }: { query: ASTNode; variables?: any }) =>
    fetch(process.env.HASURA_URL || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET || '',
      },
      body: JSON.stringify({ query: printQuery(query), variables }),
    }).then(res => {
      if (!res.status.toString().startsWith('2')) {
        return Promise.reject(res.json());
      }
      return res.json();
    });
};
