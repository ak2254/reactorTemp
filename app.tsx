import axios, { AxiosRequestConfig } from 'axios';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { useState } from 'react';

const authorizationHeader = `Bearer ${yourAuthToken}`;

const streamRequest = (): Observable<any> => {
  const config: AxiosRequestConfig = {
    method: 'get',
    url: '/{unitop}/stream',
    headers: { Authorization: authorizationHeader },
    responseType: 'stream',
  };
  
  return from(axios(config)).pipe(
    map((response) => {
      return response.data;
    })
  );
};

const fetchData = () => {
  const [data, setData] = useState<string>('');

  useEffect(() => {
    const subscription = streamRequest().subscribe(
      (incomingData) => {
        setData((prevData) => prevData + incomingData);
      },
      (error) => {
        // handle error
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      {data}
    </div>
  );
};

const MyComponent = () => {
  const data = fetchData();

  return (
    <div>
      {data}
    </div>
  );
};
