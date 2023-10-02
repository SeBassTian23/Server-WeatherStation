import { useEffect } from 'react';

export default function useEventStream(url, setData) {
  useEffect(() => {
    const eventSource = new EventSource(url);
    eventSource.onmessage = (e) => {
      console.log('Event triggered')
      setData(e.data);
    };

    eventSource.onerror = (err) => {
      console.log(err)
    };

    return () => {
      eventSource.close();
    };
  }, [url]);
}