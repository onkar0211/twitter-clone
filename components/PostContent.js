// import Avatar from "./Avatar";
// import ReactTimeAgo from "react-time-ago";
// import Link from "next/link";
// import PostButtons from "./PostButtons";

// export default function PostContent({
//   text,author,createdAt,_id,
//   likesCount,likedByMe,commentsCount,
//   images,
//   big=false}) {

//   function showImages() {
//     if (!images?.length) {
//       return '';
//     }
//     return (
//       <div className="flex -mx-1">
//         {images.length > 0 && images.map(img => (
//           <div className="m-1" key={img}>
//             <img src={img} alt=""/>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="flex w-full">
//         <div>
//           {!!author?.image && (
//             <Link href={'/'+author?.username}>
//               <div className="cursor-pointer">
//                 <Avatar src={author.image} />
//               </div>
//             </Link>
//           )}
//         </div>
//         <div className="pl-2 grow">
//           <div>
//             <Link href={'/'+author?.username}>
//               <span className="font-bold pr-1 cursor-pointer">{author?.name}</span>
//             </Link>
//             {big && (<br />)}
//             <Link href={'/'+author?.username}>
//               <span className="text-twitterLightGray cursor-pointer">@{author?.username}</span>
//             </Link>
//             {createdAt && !big && (
//               <span className="pl-1 text-twitterLightGray">
//                 <ReactTimeAgo date={createdAt} timeStyle={'twitter'} />              
//             </span>
//             )}
//           </div>
//           {!big && (
//             <div>
//               <Link href={`/${author?.username}/status/${_id}`}>
//                 <div className="w-full cursor-pointer">
//                   {text}
//                   {showImages()}
//                 </div>
//               </Link>
//               <PostButtons username={author?.username} id={_id} likesCount={likesCount} likedByMe={likedByMe} commentsCount={commentsCount} />
//             </div>
//           )}
//         </div>
//       </div>
//       {big && (
//         <div className="mt-2">
//           <Link href={`/${author?.username}/status/${_id}`}>
//             <div>
//               {text}
//               {showImages()}
//             </div>
//           </Link>
//           {createdAt && (
//             <div className="text-twitterLightGray text-sm">
//               {(new Date(createdAt))
//                 .toISOString()
//                 .replace('T', ' ')
//                 .slice(0,16)
//                 .split(' ')
//                 .reverse()
//                 .join(' ')
//               }
//             </div>
//           )}
//           <PostButtons username={author?.username} id={_id} likesCount={likesCount} likedByMe={likedByMe} commentsCount={commentsCount} />
//         </div>
//       )}
//     </div>
//   );
// }




import Avatar from "./Avatar";
import ReactTimeAgo from "react-time-ago";
import Link from "next/link";
import PostButtons from "./PostButtons";

function toMs(v) {
  if (typeof v === "number") return v;
  if (!v) return Date.now();
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? Date.now() : t;
}

export default function PostContent({
  text,
  author,
  createdAt,
  _id,
  likesCount,
  likedByMe,
  commentsCount,
  images,
  big = false,
}) {
  function showImages() {
    if (!images?.length) return null;
    return (
      <div className="flex -mx-1 mt-2">
        {images.map((img) => (
          <div className="m-1" key={img}>
            <img src={img} alt="" className="rounded-xl max-h-80 object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex w-full">
        <div>
          {!!author?.image && (
            // <Link href={`/${author?.username}`} className="cursor-pointer">
            //   <Avatar src={author.image} />
            // </Link>
            <Link href={`/${author?.username}`} legacyBehavior>
  <a className="cursor-pointer inline-flex">
    <Avatar src={author.image} />
  </a>
</Link>
          )}
        </div>

        <div className="pl-2 grow">
          <div className="flex flex-wrap items-center gap-x-1">
            <Link href={`/${author?.username}`} className="cursor-pointer">
              <span className="font-bold pr-1">{author?.name}</span>
            </Link>

            {big && <br />}

            <Link href={`/${author?.username}`} className="cursor-pointer">
              <span className="text-twitterLightGray">@{author?.username}</span>
            </Link>

            {createdAt && !big && (
              <span className="pl-1 text-twitterLightGray">
                <ReactTimeAgo date={toMs(createdAt)} timeStyle="twitter" />
              </span>
            )}
          </div>

          {!big && (
            <div className="mt-1">
              {/* ✅ Wrap multiple nodes inside a single child element */}
              <Link href={`/${author?.username}/status/${_id}`} className="block">
                <div className="w-full cursor-pointer">
                  <div>{text}</div>
                  {showImages()}
                </div>
              </Link>

              <PostButtons
                username={author?.username}
                id={_id}
                likesCount={likesCount}
                likedByMe={likedByMe}
                commentsCount={commentsCount}
              />
            </div>
          )}
        </div>
      </div>

      {big && (
        <div className="mt-2">
          {/* ✅ Same fix here */}
          <Link href={`/${author?.username}/status/${_id}`} className="block">
            <div>
              <div>{text}</div>
              {showImages()}
            </div>
          </Link>

          {createdAt && (
            <div className="text-twitterLightGray text-sm mt-2">
              {new Date(createdAt)
                .toISOString()
                .replace("T", " ")
                .slice(0, 16)
                .split(" ")
                .reverse()
                .join(" ")}
            </div>
          )}

          <PostButtons
            username={author?.username}
            id={_id}
            likesCount={likesCount}
            likedByMe={likedByMe}
            commentsCount={commentsCount}
          />
        </div>
      )}
    </div>
  );
}
