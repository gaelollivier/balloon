import { NextPage } from 'next';
import Router from 'next/router';
import React from 'react';

import Head from '../components/head';
import Login from '../components/Login';
import LoadFiles from './LoadFiles';

const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

const loadClient = () => new Promise(resolve => gapi.load('client', resolve));
const loadAuthApi = () =>
  new Promise(resolve => gapi.client.load('oauth2', 'v2', resolve));
const loadDriveApi = () =>
  new Promise(resolve => gapi.client.load('drive', 'v3', resolve));

const Home: NextPage<{ token?: string }> = ({ token }) => {
  const [auth, setAuth] = React.useState<
    'loading' | 'loggedOut' | gapi.auth2.GoogleUser
  >('loading');

  React.useEffect(() => {
    async function init() {
      await loadClient();
      await loadAuthApi();
      await loadDriveApi();
      gapi.auth2
        .init({
          client_id: process.env.GOOGLE_CLIENT_ID,
          scope: REQUIRED_SCOPES.join(' '),
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          if (authInstance.isSignedIn.get()) {
            setAuth(authInstance.currentUser.get());
          } else {
            setAuth('loggedOut');
          }
        });
    }
    init();
  }, []);

  // const handleLogout = () => {
  //   console.log('LOGOUT');
  //   const authInstance = gapi.auth2.getAuthInstance();
  //   authInstance.signOut();
  //   Router.reload();
  // };

  return (
    <>
      <Head title="Home" />
      {auth === 'loading' ? null : (
        <>
          {auth === 'loggedOut' ? (
            <Login onLogin={user => setAuth(user)} />
          ) : (
            <>
              <LoadFiles />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Home;
