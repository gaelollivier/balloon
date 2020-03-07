import React from 'react';
import Router from 'next/router';

import nextCookie from 'next-cookies';

import Head from '../components/head';
import { NextPage } from 'next';

const COOKIE_NAME = 'cloud_balloon_auth';

const Home: NextPage<{ token?: string }> = ({ token }) => {
  const [files, setFiles] = React.useState<Array<{ name: string }>>([]);

  const handleLogout = () => {
    document.cookie = `${COOKIE_NAME}=; path=/`;
    Router.reload();
  };

  React.useEffect(() => {
    if (!token) {
      return;
    }

    const loadFiles = async () => {
      const res = await fetch('/api/drive').then(res => res.json());
      setFiles(res.files);
    };
    loadFiles();
  }, [token]);

  return (
    <div>
      <Head title="Home" />
      {token ? (
        <>
          Logged in! <button onClick={handleLogout}>Logout</button>
          <ul>
            {files.map(file => (
              <li>{file.name}</li>
            ))}
          </ul>
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
