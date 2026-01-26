import { useSearchParams } from 'react-router-dom';
import GlobalHeader from "@/components/globalHeader/GloablHeader.tsx";

const Lv1Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const tabList = [
    {
      key: "tab1",
      tab: "选项1",
    },
    {
      key: "tab2",
      tab: "选项2",
    },
    {
      key: "tab3",
      tab: "选项3",
    },
  ];

  const handleTabClick = (key: string) => {
    setSearchParams({ tab: key });
  };

  return (
    <>
      <GlobalHeader />
      <div>
        <ul>
          {tabList.map((item) => (
            <li 
              key={item.key} 
              onClick={() => handleTabClick(item.key)}
              style={{ 
                cursor: 'pointer', 
                padding: '8px', 
                borderBottom: '1px solid #eee',
                backgroundColor: searchParams.get('tab') === item.key ? '#e6f7ff' : 'white'
              }}
            >
              {item.tab}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Lv1Menu;