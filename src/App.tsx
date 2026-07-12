import { useEffect } from 'react';
import { AppRouter } from './router';
import { useCatalogStore } from './store';

function App() {
  useEffect(() => { useCatalogStore.getState().fetch(); }, []);
  return <AppRouter />;
}

export default App;
