import { serialize } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { COOKIE_NAME } from '../../../utils/auth';

const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

interface AuthResult {
  token: string;
  tokenSecret: string;
  profile: any;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.SERVER_URL}/api/auth/google`,
    },
    (token, tokenSecret, profile, done) => {
      // NOTE: This is where we're supposed to match Google's identity with an internal user DB
      // but we don't have one (yet?)
      done(undefined, { token, tokenSecret, profile });
    }
  )
);

/**
 * Promise wrapper for passport.authenticate
 * NOTE: This is a bit hacky since passport is supposed to be used as an express middleware,
 * but since Next.js doesn't allow express middlewares in their default server setup, we need
 * to call passport middleware manually
 */
async function passportAuthenticate(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthResult> {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'google',
      { scope: REQUIRED_SCOPES, failureRedirect: '/' },
      (err, auth) => {
        if (err) {
          reject(err);
        } else {
          resolve(auth);
        }
      }
    )(req, res);
  });
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // TODO: Error handling...
  const auth = await passportAuthenticate(req, res);
  // console.log(JSON.stringify(auth, null, 4));

  const { token } = auth;

  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, { path: '/' }));
  res.writeHead(302, { Location: '/' });
  res.end();
};

export default handler;
