import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { CarryOutOutlined, InboxOutlined, PieChartOutlined, SunOutlined } from "@ant-design/icons";
import App from '../App';
import GlobalLayout from "@/layout/GlobalLayout";
import TodoList from "@/pages/todoList/Index";
import Overview from "@/pages/overview/Index";
import Collect from "@/pages/collect/Index";
import Recycle from "@/pages/recycle/Index";
import Statistics from "@/pages/statistics/Index";
import Login from "@/pages/login/Index";
import SelectType from "@/pages/selectType/Index";

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/menu',
        element: <GlobalLayout />,
        children: [
          {
            path: '/menu/todo',
            element: <TodoList />,
            handle: {
              title: '今日待办',
              icon: <SunOutlined />,
            }
          },
          {
            path: '/menu/view',
            element: <Overview />,
            handle: {
              title: '日程概览',
              icon: <CarryOutOutlined />
            }
          },
          {
            path: '/menu/collect',
            element: <Collect />,
            handle: {
              title: '收集箱',
              icon: <InboxOutlined />
            }
          },
          {
            path: '/menu/type',
            element: <SelectType />,
          },
          // {
          //   path: '/menu/statistics',
          //   element: <Statistics />,
          //   handle: {
          //     title: '数据统计',
          //     icon: <PieChartOutlined />
          //   }
          // },
          {
            path: '/menu/recycle',
            element: <Recycle />,
          },
          {
            path: '',
            element: <Navigate to="todo" replace />
          }
        ],
      },
      {
        path: '',
        element: <Navigate to="/menu" replace />
      },
      {
        path: '*',
        element: <Navigate to="/menu" replace />
      }
    ],
  },
];

const router = createBrowserRouter(routes);

const getTargetRoute = (path: string, routeList: RouteObject[] = routes): RouteObject | undefined => {
  for (const route of routeList) {
    if (route.path === path) {
      return route;
    }
    if (route.children) {
      const found: RouteObject | undefined = getTargetRoute(path, route.children);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

export {
  router,
  getTargetRoute
}
