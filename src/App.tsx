import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import ErrorBoundary from '@/Components/ErrorBoundary.jsx';
import LoadingProgress from '@/Components/LoadingProgress.jsx';
import { api_checkLogin } from '@/Apis';
import { message, ConfigProvider } from 'antd';
import UserContext from '@/Contexts/user';
import PageContext from '@/Contexts/pageConfig';
import zhCN from 'antd/lib/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import type { ICheckLoginResponse } from './Common/interface';

const DefaultLayout = React.lazy(() => import(/* webpackChunkName: 'defaultLayout' */ './Layout'));
const Page403 = React.lazy(
  () => import(/* webpackChunkName: 'page403' */ './Pages/Forbidden/index.jsx'),
);

const Login = React.lazy(() => import(/* webpackChunkName: 'Login' */ '@/Pages/Login'));
const Register = React.lazy(() => import(/* webpackChunkName: 'Register' */ '@/Pages/Register'));

const App = () => {
  const [userInfo, setUserInfo] = useState<ICheckLoginResponse>({
    name: '',
    avatar: '',
    displayname: '',
    mail: '',
  });
  const [kconfConfig, setKconfConfig] = useState({});
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const res = await api_checkLogin();
        // const roleData = await api_getUserRole({
        //   username: res?.data?.username,
        // });
        setUserInfo(res.data);
        console.log('userInfo', res);
      } catch (err) {
        message.error(err?.message || '获取用户信息失败，请稍后再试~');
      } finally {
        setIsReady(true);
      }
    };
    getUserInfo();
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingProgress />}>
        <ConfigProvider locale={zhCN}>
          <PageContext.Provider value={{ kconfConfig }}>
            {isReady ? (
              <UserContext.Provider value={userInfo}>
                <BrowserRouter basename="micro-manage-v2">
                  <Switch>
                    <Route path="/" exact render={() => <Redirect to="/app" />} />
                    <Route path="/403" exact component={Page403} />
                    <Route path="/login" exact component={Login} />
                    <Route path="/register" exact component={Register} />
                    <Route component={DefaultLayout} />
                  </Switch>
                </BrowserRouter>
              </UserContext.Provider>
            ) : null}
          </PageContext.Provider>
        </ConfigProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
