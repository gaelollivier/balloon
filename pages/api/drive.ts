import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

const COOKIE_NAME = 'cloud_balloon_auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || '',
    process.env.GOOGLE_CLIENT_SECRET || ''
  );

  oAuth2Client.setCredentials({ access_token: req.cookies[COOKIE_NAME] });

  const drive = google.drive({
    version: 'v3',
    auth: oAuth2Client
  });

  const filesResponse = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)'
  });

  const files = filesResponse.data.files;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ files }));
};

export default handler;
