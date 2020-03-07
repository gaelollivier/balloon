import passport from 'passport';
import { NextApiRequest, NextApiResponse } from 'next';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { serialize } from 'cookie';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.SERVER_URL}/api/auth/google`
    },
    (token, tokenSecret, profile, done) => {
      done(undefined, { token, tokenSecret, profile });
    }
  )
);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise(resolve => {
    passport.authenticate(
      'google',
      {
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/drive.metadata.readonly'
        ],
        failureRedirect: '/login'
      },
      (err, auth) => {
        // TODO: Error handling...
        console.log(err, auth);
        res.setHeader(
          'Set-Cookie',
          serialize('cloud_balloon_auth', auth.token, { path: '/' })
        );
        res.writeHead(302, { Location: '/' });
        res.end();
        resolve();
      }
    )(req, res);
  });
};

export default handler;
