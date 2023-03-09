
import axios, { AxiosRequestConfig } from 'axios';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  useEffect(() => {
    const subscription = streamRequest().subscribe(
      (data) => {
        // handle incoming data
      },
      (error) => {
        // handle error
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};

const MyComponent = () => {
  fetchData();

  // render the component as needed
};
