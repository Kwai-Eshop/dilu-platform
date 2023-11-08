import loadable from 'react-loadable';
import LoadingProgress from '@/Components/LoadingProgress.jsx';

export default (loader, loading = LoadingProgress) => {
  return loadable({
    loader,
    loading,
  });
};
