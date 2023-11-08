import { lazy } from 'react';

const MainAppList = lazy(
  () => import(/* webpackChunkName: 'mainAppList' */ '@/Pages/App/Main/List'),
);
const MainAppManage = lazy(
  () => import(/* webpackChunkName: 'mainAppManage' */ '@/Pages/App/Main/Manage'),
);
const SubAppList = lazy(() => import(/* webpackChunkName: 'subAppList' */ '@/Pages/App/Sub/List'));
const VersionList = lazy(
  () => import(/* webpackChunkName: 'versionList' */ '@/Pages/Version/List'),
);
const VersionManage = lazy(
  () => import(/* webpackChunkName: 'versionManage' */ '@/Pages/Version/Manage'),
);
const VersionLane = lazy(
  () => import(/* webpackChunkName: 'versionLane' */ '@/Pages/Version/Lane'),
);
const LogList = lazy(() => import(/* webpackChunkName: 'logList' */ '@/Pages/Log/List'));
const Page404 = lazy(() => import(/* webpackChunkName: 'page404' */ '@/Pages/NotFound'));
const HistoryVersion = lazy(
  () => import(/* webpackChunkName: 'subHistory' */ '@/Pages/App/Sub/History'),
);

const routes = [
  {
    path: '/app/main/list',
    exact: true,
    name: '主应用管理',
    component: MainAppList,
  },
  {
    path: '/app/main/manage',
    exact: true,
    name: '主应用管理',
    component: MainAppManage,
  },
  {
    path: '/app/sub/list',
    exact: true,
    name: '子应用管理',
    component: SubAppList,
  },
  {
    path: '/app/sub/history',
    exact: true,
    name: '子应用历史版本',
    component: HistoryVersion,
  },
  {
    path: '/version/list',
    exact: true,
    name: '子应用版本列表',
    component: VersionList,
  },
  {
    path: '/version/manage',
    exact: true,
    name: '子应用版本管理',
    component: VersionManage,
  },
  {
    path: '/version/lane',
    exact: true,
    name: '子应用版本管理',
    component: VersionLane,
  },
  { path: '/log/list', exact: true, name: '操作日志', component: LogList },
  { path: '/404', exact: true, name: '404', component: Page404 },
];

export default routes;
