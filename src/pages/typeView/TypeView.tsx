import {useSearchParams} from "react-router-dom";

const TagView = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  return (
    <div>{type}</div>
  )
}
export default TagView
