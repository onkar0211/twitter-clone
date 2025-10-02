// import {useEffect,useState} from "react";
// import {useSession} from "next-auth/react";

// export default function useUserInfo() {

//   const {data:session,status:sessionStatus} = useSession();
//   const [userInfo,setUserInfo] = useState(null);
//   const [status,setStatus] = useState('loading');

//   function getUserInfo() {
//     if(sessionStatus === 'loading') {
//       return;
//     }
//     if (sessionStatus === 'unauthenticated') {
//       setStatus('unauthenticated');
//       return;
//     }
//     console.log('fetch');
//     fetch('/api/users?id='+session.user.id)
//       .then(response => {
//         response.json().then(json => {
//           setUserInfo(json.user);
//           setStatus('authenticated');
//         })
//       })
//   }

//   useEffect(() => {
//     getUserInfo();
//   }, [sessionStatus]);

//   return {userInfo,setUserInfo,status};
// }


// hooks/useUserInfo.js
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function useUserInfo() {
  const { data: session, status: sessionStatus } = useSession();
  const [userInfo, setUserInfo] = useState(null);
  const [status, setStatus] = useState("loading");

  const getUserInfo = useCallback(async () => {
    if (sessionStatus === "loading") return;

    if (sessionStatus === "unauthenticated" || !session?.user?.id) {
      setStatus("unauthenticated");
      setUserInfo(null);
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(session.user.id)}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      const json = await res.json();
      setUserInfo(json.user || null);
      setStatus("authenticated");
    } catch (e) {
      console.error("getUserInfo failed:", e);
      setStatus("error");
      setUserInfo(null);
    }
  }, [sessionStatus, session?.user?.id]);

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]); // ✅ include the function; no ESLint warning

  return { userInfo, setUserInfo, status };
}
