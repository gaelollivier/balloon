import React, { useEffect, useState } from 'react';
import getConfig from 'next/config';

import Head from '../components/head';
import { NextPage } from 'next';

const { publicRuntimeConfig } = getConfig();

const Home: NextPage = () => {
  const [res, setRes] = useState(null);

  useEffect(() => {
    async function graphqlTest() {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ hello }' })
      });
      setRes(await res.json());
    }
    graphqlTest();
  }, []);

  return (
    <div>
      <Head title="Home" />

      <div>Config! {JSON.stringify(publicRuntimeConfig, null, 4)}</div>
      <div>GraphQL! {JSON.stringify(res, null, 4)}</div>
    </div>
  );
};

export default Home;
