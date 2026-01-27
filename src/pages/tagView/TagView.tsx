import {useSearchParams} from "react-router-dom";

const TagView = () => {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  console.log(tag)
  return (
    <div>{tag}</div>
  )
}
export default TagView
