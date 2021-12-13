import { useParams } from 'react-router-dom';

function Post() {
  const params = useParams();

  return <div>{params.id}</div>;
}

export default Post;
