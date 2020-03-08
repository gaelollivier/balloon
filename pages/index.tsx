import { NextPage } from 'next';
import nextCookie from 'next-cookies';
import Router from 'next/router';
import React from 'react';

import Head from '../components/head';
import { COOKIE_NAME } from '../utils/auth';

const Home: NextPage<{ token?: string }> = ({ token }) => {
  const handleLogout = () => {
    document.cookie = `${COOKIE_NAME}=; path=/`;
    Router.reload();
  };

  return (
    <div>
      <Head title="Home" />
      {token ? (
        <>
          Logged in! <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <a href="/api/auth/google">
            <button>Login with Google</button>
          </a>
        </>
      )}
    </div>
  );
};

Home.getInitialProps = ctx => {
  const { [COOKIE_NAME]: token } = nextCookie(ctx);
  return { token };
};

export default Home;
