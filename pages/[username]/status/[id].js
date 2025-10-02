// import {useRouter} from "next/router";
// import {useEffect, useState} from "react";
// import axios from "axios";
// import PostContent from "../../../components/PostContent";
// import Layout from "../../../components/Layout";
// import Link from "next/link";
// import useUserInfo from "../../../hooks/useUserInfo";
// import PostForm from "../../../components/PostForm";
// import TopNavLink from "../../../components/TopNavLink";

// export default function PostPage() {
//   const router = useRouter();
//   const {id} = router.query;
//   const [post,setPost] = useState();
//   const [replies,setReplies] = useState([]);
//   const [repliesLikedByMe,setRepliesLikedByMe] = useState([]);
//   const {userInfo} = useUserInfo();

//   function fetchData() {
//     axios.get('/api/posts?id='+id)
//       .then(response => {
//         setPost(response.data.post);
//       });
//     axios.get('/api/posts?parent='+id)
//       .then(response => {
//         setReplies(response.data.posts);
//         setRepliesLikedByMe(response.data.idsLikedByMe);
//       })
//   }

//   useEffect(() => {
//     if (!id) {
//       return;
//     }
//     fetchData();
//   }, [id]);

//   return (
//     <Layout>
//       {!!post?._id && (
//         <div className="px-5 py-2">
//           <TopNavLink />
//           {post.parent && (
//             <div className="pb-1">
//               <PostContent {...post.parent} />
//               <div className="ml-5 h-12 relative">
//                 <div className="h-20 border-l-2 border-twitterBorder absolute -top-5"
//                      style={{marginLeft:'2px'}}></div>
//               </div>
//             </div>
//           )}
//           <div>
//             <PostContent {...post} big />
//           </div>
//         </div>
//       )}
//       {!!userInfo && (
//         <div className="border-t border-twitterBorder py-5">
//           <PostForm onPost={fetchData}
//                     parent={id}
//                     compact placeholder={'Tweet your reply'} />
//         </div>
//       )}
//       <div className="">
//         {replies.length > 0 && replies.map(reply => (
//           <div className="p-5 border-t border-twitterBorder" key={reply._id}>
//             <PostContent {...reply} likedByMe={repliesLikedByMe.includes(reply._id)} />
//           </div>
//         ))}
//       </div>
//     </Layout>
//   );
// }


import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import PostContent from "../../../components/PostContent";
import Layout from "../../../components/Layout";
import TopNavLink from "../../../components/TopNavLink";
import useUserInfo from "../../../hooks/useUserInfo";
import PostForm from "../../../components/PostForm";

export default function PostPage() {
  const router = useRouter();
  const { id: idParam } = router.query;

  // router.query.id can be string | string[] | undefined
  const id = Array.isArray(idParam) ? idParam[0] : idParam || "";

  const [post, setPost] = useState();
  const [replies, setReplies] = useState([]);
  const [repliesLikedByMe, setRepliesLikedByMe] = useState([]);
  const { userInfo } = useUserInfo();

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [postRes, repliesRes] = await Promise.all([
        axios.get("/api/posts", { params: { id } }),
        axios.get("/api/posts", { params: { parent: id } }),
      ]);

      setPost(postRes?.data?.post || null);
      setReplies(repliesRes?.data?.posts || []);
      setRepliesLikedByMe(repliesRes?.data?.idsLikedByMe || []);
    } catch (err) {
      console.error("Failed to load post/replies:", err);
      setPost(null);
      setReplies([]);
      setRepliesLikedByMe([]);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id, fetchData]);

  // Avoid ObjectId vs string mismatches
  const likedSet = useMemo(
    () => new Set((repliesLikedByMe || []).map((x) => String(x))),
    [repliesLikedByMe]
  );

  return (
    <Layout>
      {!!post?._id && (
        <div className="px-5 py-2">
          <TopNavLink />
          {post.parent && (
            <div className="pb-1">
              <PostContent {...post.parent} />
              <div className="ml-5 h-12 relative">
                <div
                  className="h-20 border-l-2 border-twitterBorder absolute -top-5"
                  style={{ marginLeft: "2px" }}
                />
              </div>
            </div>
          )}
          <div>
            <PostContent {...post} big />
          </div>
        </div>
      )}

      {!!userInfo && (
        <div className="border-t border-twitterBorder py-5">
          <PostForm
            onPost={fetchData} // safe: stable per id
            parent={id}
            compact
            placeholder={"Tweet your reply"}
          />
        </div>
      )}

      <div>
        {replies.length > 0 &&
          replies.map((reply) => (
            <div className="p-5 border-t border-twitterBorder" key={reply._id}>
              <PostContent
                {...reply}
                likedByMe={likedSet.has(String(reply._id))}
              />
            </div>
          ))}
      </div>
    </Layout>
  );
}
