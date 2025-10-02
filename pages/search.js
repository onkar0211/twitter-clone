// // pages/search.js
// import { useState } from "react";
// import Layout from "../components/Layout";
// import SearchUser from "../components/SearchUser";
// import Link from "next/link";
// export default function UserSearchPage() {
//   const [result, setResult] = useState(null);

//   return (
//     <Layout>
//       <div className="p-5">
//         <SearchUser onResult={(data) => setResult(data)} />

//         {/* {result?.user && (
//           <div className="mt-4 p-4 border border-twitterBorder rounded-xl">
//             <div className="font-semibold text-lg">{result.user.name}</div>
//             <div className="text-twitterLightGray">@{result.user.username}</div>
//             <div className="text-sm mt-1">_id: {result.user._id}</div>
//             <div className="text-sm mt-1">
//               Following? {result.follow ? "Yes" : "No"}
//             </div>
//           </div>
//         )} */}

//         {result?.user && (
//   <div className="mt-4 p-4 border border-twitterBorder rounded-xl">
//     <Link
//       href={`/${result.user.username}`}
//       className="font-semibold text-lg underline hover:opacity-80"
//     >
//       {result.user.name}
//     </Link>
//     <div className="text-twitterLightGray">@{result.user.username}</div>
//     <div className="text-sm mt-1">_id: {result.user._id}</div>
//        <div className="text-sm mt-1">
//       Following? {result.follow ? "Yes" : "No"}
//     </div> 
//   </div>
// )}
//       </div>
//     </Layout>
//   );
// }


// pages/search.js
import { useState } from "react";
import Link from "next/link";               // ✅ add this import
import Layout from "../components/Layout";
import SearchUser from "../components/SearchUser";

export default function UserSearchPage() {
  const [result, setResult] = useState(null);

  return (
    <Layout>
      <div className="p-5">
        <SearchUser onResult={(data) => setResult(data)} />

        {result?.user && (
          <div className="mt-4 p-4 border border-twitterBorder rounded-xl">
            <Link
              href={`/${result.user.username}`}
              className="font-semibold text-lg underline hover:opacity-80"
            >
              {result.user.name}
            </Link>
            <div className="text-twitterLightGray">@{result.user.username}</div>
            <div className="text-sm mt-1">_id: {result.user._id}</div>
            <div className="text-sm mt-1">
              Following? {result.follow ? "Yes" : "No"}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

