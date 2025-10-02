import {signOut, useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import UsernameForm from "../components/UsernameForm";
import useUserInfo from "../hooks/useUserInfo";
import PostForm from "../components/PostForm";
import axios from "axios";
import PostContent from "../components/PostContent";
import Layout from "../components/Layout";
import {useRouter} from "next/router";
import SearchUser from "../components/SearchUser";


export default function Home() {
  const [result, setResult] = useState(null);

  const {data:session} = useSession();
  const {userInfo,setUserInfo,status:userInfoStatus} = useUserInfo();
  const [posts,setPosts] = useState([]);
  const [idsLikedByMe,setIdsLikedByMe] = useState([]);
  const router = useRouter();

  function fetchHomePosts() {
    axios.get('/api/posts').then(response => {
      setPosts(response.data.posts);
      setIdsLikedByMe(response.data.idsLikedByMe);
    });
  }

  async function logout() {
    setUserInfo(null);
    await signOut();
  }

  useEffect(() => {
    fetchHomePosts();
  }, []);

  if (userInfoStatus === 'loading') {
    return 'loading user info';
  }

  if (userInfo && !userInfo?.username) {
    return <UsernameForm />;
  }

  if (!userInfo) {
    console.log({session});
    router.push('/login');
    return 'no user info';
  }

  return (
    <Layout>
      {/** Search User Component **/}
      <div className="p-5">
        <SearchUser onResult={(data) => setResult(data)} />

        {result?.user && (
          <div className="mt-4 p-4 border border-twitterBorder rounded-xl">
            <div className="font-semibold text-lg">{result.user.name}</div>
            <div className="text-twitterLightGray">@{result.user.username}</div>
            <div className="text-sm mt-1">_id: {result.user._id}</div>
            <div className="text-sm mt-1">
              Following? {result.follow ? "Yes" : "No"}
            </div>
          </div>
        )}
      </div>
      {/** End Search User Component **/}

      <h1 className="text-lg font-bold p-4">Home</h1>
      <PostForm onPost={() => {fetchHomePosts();}} />
      <div className="">
        {posts.length > 0 && posts.map(post => (
          <div className="border-t border-twitterBorder p-5" key={post._id}>
            {post.parent && (
              <div>
                <PostContent {...post.parent} />
                <div className="relative h-8">
                  <div className="border-l-2 border-twitterBorder h-10 absolute ml-6 -top-4"></div>
                </div>
              </div>
            )}
            <PostContent {...post} likedByMe={idsLikedByMe.includes(post._id)} />
          </div>
        ))}
      </div>
      {userInfo && (
        <div className="p-5 text-center border-t border-twitterBorder">
          <button onClick={logout} className="bg-twitterWhite text-black px-5 py-2 rounded-full">Logout</button>
        </div>
      )}
    </Layout>
  )
}
