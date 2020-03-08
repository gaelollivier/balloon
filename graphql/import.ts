import { gql } from 'apollo-server-micro';

import { Context } from './context';

const INSERT_FILES = gql`
  mutation InsertFiles($files: [files_insert_input!]!) {
    insert_files(objects: $files) {
      affected_rows
    }
  }
`;

export async function importFiles({ hasura, drive }: Context) {
  let total = { count: 0, size: 0 };
  let pageToken: string | undefined;
  while (true) {
    console.log({ total });
    // console.time('query');
    const {
      data: { files, nextPageToken },
    } = await drive.files.list({
      pageSize: 1000,
      // fields: 'nextPageToken, files(*)',
      fields: 'nextPageToken, files(id,size,name,mimeType,parents)',
      pageToken,
    });
    // console.timeEnd('query');
    // console.log(JSON.stringify(filesResponse.data, null, 4));

    pageToken = nextPageToken;

    if (!files?.length) {
      return 'OK';
    }

    const filesInput: Array<{
      id: string;
      name: string;
      mimeType: string;
      size: number;
      parents: Array<string>;
    }> = files.map(
      ({ id = '', name = '', size: sizeStr, parents = [], mimeType = '' }) => {
        if (sizeStr !== undefined && Number.isNaN(Number(sizeStr))) {
          console.log('Invalid size', { id, name, sizeStr });
        }
        const size = Number(sizeStr) || 0;
        return { id, name, mimeType, size, parents };
      }
    );

    const res = await hasura({
      query: INSERT_FILES,
      variables: { files: filesInput },
    });
    // console.log(JSON.stringify(res, null, 4));

    total = {
      count: total.count + files.length,
      size: filesInput.reduce((sum, file) => sum + file.size, 0),
    };

    if (!pageToken) {
      return 'OK';
    }
  }
}
