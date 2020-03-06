import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from '../components/head';
import { NextPage } from 'next';

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

      <div>Test! {JSON.stringify(res, null, 4)}</div>
    </div>
  );
};

export default Home;
