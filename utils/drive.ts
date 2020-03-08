import { google } from 'googleapis';
import { NextApiRequest } from 'next';

import { COOKIE_NAME } from './auth';

export const getGoogleDriveClient = (req: NextApiRequest) => {
  const accessToken = req.headers['authorization'] || req.cookies[COOKIE_NAME];

  // Setup google drive client
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || '',
    process.env.GOOGLE_CLIENT_SECRET || ''
  );

  oAuth2Client.setCredentials({ access_token: accessToken });

  return google.drive({
    version: 'v3',
    auth: oAuth2Client,
  });
};
