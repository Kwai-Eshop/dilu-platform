import React, { Suspense, useState, useContext } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import LoadingProgress from '@/Components/LoadingProgress.jsx';
import { Layout } from 'antd';
import routes from '@/routes';
import asideMenus from './menus';
import styles from './index.module.less';

import AppHeader from './AppHeader';
import AppAside from './AppAside.jsx';
import AppFooter from './AppFooter.jsx';

import UserContext from '@/Contexts/user';
import { useLocation } from 'react-router-dom';

const { Content } = Layout;

const DefaultLayout = () => {
  const [menus] = useState(asideMenus);

  const location = useLocation();
  console.log('location', location);

  const userInfo = useContext(UserContext);

  return (
    <Layout
      className={styles.app}
      style={{
        minHeight: '100vh',
      }}
    >
      <AppHeader {...userInfo} />
      <Layout className={styles.container}>
        <AppAside menus={menus} />
        <Content className={styles.content}>
          <Suspense fallback={<LoadingProgress />}>
            <Switch>
              <Route path="/app" exact render={() => <Redirect to="/app/main/list" />} />
              {routes.map((item) => {
                const Component = item.component;
                return (
                  <Route
                    key={item.path}
                    path={item.path}
                    exact={item.exact}
                    // @ts-ignore
                    render={(props) => <Component {...props} />}
                  />
                );
              })}
              <Redirect to="/404" />
            </Switch>
          </Suspense>
        </Content>
      </Layout>
      <AppFooter />
    </Layout>
  );
};

export default withRouter(DefaultLayout);
