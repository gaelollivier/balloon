import Dexie from 'dexie';
import React from 'react';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

interface File {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  parent: string | null;
}

class FileDatabase extends Dexie {
  public files: Dexie.Table<File, string>;

  public constructor() {
    super('FileDatabase');
    this.version(1).stores({
      files: 'id,name,mimeType,size,parent',
    });
    this.files = this.table('files');
  }
}

const db = new FileDatabase();
// For debug purposes, expose to global scope
(global as any).db = db;

async function deepUpdateFolderSize({
  id,
  isRoot,
  path = '/Root',
}: {
  id: string;
  isRoot?: boolean;
  path?: string;
}): Promise<number> {
  // console.log(path);

  const children = await db.files
    .where('parent')
    .equals(id)
    .toArray();

  const childrenWithSize = await Promise.all(
    children.map(async child => {
      if (child.mimeType === FOLDER_MIME_TYPE) {
        return {
          child,
          size: await deepUpdateFolderSize({
            id: child.id,
            path: `${path}/${child.name}`,
          }),
        };
      } else {
        return {
          child,
          size: child.size,
        };
      }
    })
  );

  const calculatedSize = childrenWithSize.reduce(
    (sum, { size }) => sum + size,
    0
  );

  if (!isRoot) {
    await db.files.update(id, { calculatedSize });
  }

  return calculatedSize;
}

const LoadFiles = () => {
  const handleLoad = async () => {
    // return;
    console.time('LoadFiles');
    let total = { count: 0, size: 0 };
    let pageToken: string | undefined;

    // Reset collection
    await db.files.clear();

    while (true) {
      const {
        result: { files, nextPageToken },
      } = await gapi.client.drive.files.list({
        pageSize: 1000,
        fields:
          'nextPageToken, files(id,size,name,mimeType,parents,ownedByMe,trashed)',
        pageToken,
      });

      pageToken = nextPageToken;

      const filesInput = (files || [])
        // Keep only files owned by current user
        .filter(({ ownedByMe, trashed }) => ownedByMe && !trashed)
        .map(
          ({
            id = '',
            name = '',
            size: sizeStr,
            parents = [],
            mimeType = '',
          }) => {
            if (sizeStr !== undefined && Number.isNaN(Number(sizeStr))) {
              console.log('Invalid size', { id, name, sizeStr });
            }
            const size = Number(sizeStr) || 0;
            return { id, name, mimeType, size, parent: parents[0] || null };
          }
        );

      if (!filesInput.length) {
        console.log('DONE!');
        break;
      }

      await db.files.bulkAdd(filesInput);

      total = {
        count: total.count + filesInput.length,
        size: total.size + filesInput.reduce((sum, file) => sum + file.size, 0),
      };

      console.log(total);

      if (!pageToken) {
        console.log('DONE 2!');
        break;
      }
    }

    console.timeEnd('LoadFiles');
  };

  const handleTest = async () => {
    const {
      result: { id: rootFolderId },
    } = await gapi.client.drive.files.get({ fileId: 'root' });
    if (!rootFolderId) {
      console.error('Cannot find root folder');
      return;
    }

    await deepUpdateFolderSize({ id: rootFolderId, isRoot: true });
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden bg-fixed p-5">
        <p className="text-xl leading-tight text-center">Cloud Balloon</p>
        <div className="flex flex-col items-center">
          <div className="mt-4">
            <button
              className="text-green-500 hover:text-white hover:bg-green-500 border border-green-500 text-xs font-semibold rounded-full px-4 py-1 leading-normal"
              onClick={handleLoad}
            >
              Load Files from Drive
            </button>
          </div>
          <div className="mt-3">
            <button
              className="text-green-500 hover:text-white hover:bg-green-500 border border-green-500 text-xs font-semibold rounded-full px-4 py-1 leading-normal"
              onClick={handleTest}
            >
              Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadFiles;
