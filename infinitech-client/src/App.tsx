import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import { AppRouter } from './router/AppRouter';
import { useAppDispatch } from './app/hooks';
import { setCredentials } from './features/auth/authSlice';
import { authApi } from './api/authApi';

function AuthRestorer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Try to restore session via httpOnly cookie refresh
    store.dispatch(authApi.endpoints.refresh.initiate())
      .then((result) => {
        if ('data' in result && result.data) {
          dispatch(setCredentials({ user: result.data.user, accessToken: result.data.accessToken }));
        }
      })
      .catch(() => {});
  }, [dispatch]);

  return null;
}

function AppContent() {
  return (
    <>
      <AuthRestorer />
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px' },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}
