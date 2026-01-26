import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Lv1Menu from "@/pages/lv1Menu/Lv1Menu.tsx";
import Main from "@/pages/main/Main.tsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '/',
        element: <Lv1Menu />,
        children: [
          {
            path: 'main',
            element: <Main />,
          },
        ],
      }
    ],
  },
]);

export default router;
