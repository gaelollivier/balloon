import Dexie from 'dexie';

export interface File {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  parent: string | null;
  calculatedSize?: number;
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

export const db = new FileDatabase();
// For debug purposes, expose to global scope
(global as any).db = db;
