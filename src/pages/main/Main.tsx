import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlobalHeader from "@/components/globalHeader/GloablHeader.tsx";
import TodoList from "@/pages/todoList/TodoList.tsx";
import Statistics from "@/pages/statistics/Statistics.tsx";

const MainContent = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('tab1');
  const [content, setContent] = useState('这是选项1的内容');

  useEffect(() => {
    const tab = searchParams.get('tab') || 'tab1';
    setActiveTab(tab);

    switch(tab) {
      case 'tab1':
        setContent('这是选项1的内容');
        break;
      case 'tab2':
        setContent('这是选项2的内容');
        break;
      case 'tab3':
        setContent('这是选项3的内容');
        break;
      default:
        setContent('未知页面');
    }
  }, [searchParams]);

  return (
    <>
      <GlobalHeader hasControl={true} />
      <div style={{padding: '0 10px 10px 10px'}}>
        <h2>当前激活标签: {activeTab}</h2>
        <p>{content}</p>
      </div>
    </>
  );
};

export default MainContent;
