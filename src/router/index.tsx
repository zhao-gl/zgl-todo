import {createBrowserRouter, Navigate, RouteObject} from 'react-router-dom';
import {CarryOutOutlined, InboxOutlined, PieChartOutlined, SunOutlined} from "@ant-design/icons";
import App from '../App';
import GlobalLayout from "@/layout/GlobalLayout";
import TodoList from "@/pages/todoList/TodoList";
import Overview from "@/pages/overview/Overview";
import Collect from "@/pages/collect/Collect";
import TagView from "@/pages/tagView/TagView.tsx";
import Recycle from "@/pages/recycle/Recycle.tsx";
import Statistics from "@/pages/statistics/Statistics.tsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
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
          // {
          //   path: '/menu/statistics',
          //   element: <Statistics />,
          //   handle: {
          //     title: '数据统计',
          //     icon: <PieChartOutlined />
          //   }
          // },
          {
            path: '/menu/tag',
            element: <TagView />,
            handle: {
              // title: '收集箱',
              // icon: <InboxOutlined />
            }
          },
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
]);

// 获取菜单子路由
const getTargetRoute = (path: string, route?: RouteObject): RouteObject | undefined => {
  if(!route){
    route = router.routes[0]
  }
  if(route.path === path) return route
  // 递归查找子路由
  if (route.children) {
    for (const child of route.children) {
      const found: RouteObject |  undefined = getTargetRoute(path, child);
      if (found) {
        return found;
      }
    }
  }
  return undefined
}

export {
  router,
  getTargetRoute
}
