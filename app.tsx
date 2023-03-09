import React, { useState, useEffect } from 'react';

const Home = () => {
  const [data, setData] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await fetch('/api/my-stream', {
          headers: { Authorization: 'my-auth-token' },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        let receivedData = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          receivedData += new TextDecoder().decode(value);
          setData(receivedData);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  return <div>{data}</div>;
};

export default Home;
