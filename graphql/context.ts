import { drive_v3 } from 'googleapis';

import { HasuraClient } from '../utils/hasura';

export interface Context {
  hasura: HasuraClient;
  drive: drive_v3.Drive;
}
