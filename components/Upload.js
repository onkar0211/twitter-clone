// import {useState} from "react";
// import {FileDrop} from "react-file-drop";

// export default function Upload({children,onUploadFinish}) {

//   const [isFileNearby, setIsFileNearby] = useState(false);
//   const [isFileOver,setIsFileOver] = useState(false);
//   const [isUploading,setIsUploading] = useState(false);

//   function uploadImage(files,e) {
//     e.preventDefault();
//     setIsFileNearby(false);
//     setIsFileOver(false);
//     setIsUploading(true);
//     const data = new FormData();
//     data.append('post', files[0]);
//     fetch('/api/upload', {
//       method: 'POST',
//       body:data,
//     }).then(async response => {
//       const json = await response.json();
//       const src = json.src;
//       onUploadFinish(src);
//       setIsUploading(false);
//     });
//   }

//   return (
//     <FileDrop
//       onDrop={uploadImage}
//       onDragOver={() => setIsFileOver(true)}
//       onDragLeave={() => setIsFileOver(false)}
//       onFrameDragEnter={() => setIsFileNearby(true)}
//       onFrameDragLeave={() => setIsFileNearby(false)}
//       onFrameDrop={() => {
//         setIsFileNearby(false);
//         setIsFileOver(false);
//       }}
//     >
//       <div className="relative">
//         {(isFileNearby || isFileOver) && (
//           <div className="bg-twitterBlue absolute inset-0 flex items-center justify-center">drop your images here</div>
//         )}
//         {children({isUploading})}
//       </div>
//     </FileDrop>
//   );
// }

import { useRef, useState, useEffect } from "react";
import { FileDrop } from "react-file-drop";

export default function Upload({ children, onUploadFinish }) {
  const [isFileNearby, setIsFileNearby] = useState(false);
  const [isFileOver, setIsFileOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const abortRef = useRef(null);

  // Optional: cleanup abort on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  async function uploadImage(files, e) {
    e?.preventDefault?.();

    // Normalize files to a single File
    const file =
      (files && (files[0] || (files.item && files.item(0)))) || null;
    if (!file) {
      // No file dropped
      setIsFileNearby(false);
      setIsFileOver(false);
      return;
    }

    setIsFileNearby(false);
    setIsFileOver(false);
    setIsUploading(true);

    const data = new FormData();
    // NOTE: keep the field name 'post' only if your API expects it.
    // Many backends expect 'file' — align with your /api/upload handler.
    data.append("post", file);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
        signal: controller.signal,
      });

      const text = await res.text(); // read once (could be JSON or HTML)
      if (!res.ok) {
        // Try to parse JSON error, else show text snippet
        try {
          const j = JSON.parse(text);
          throw new Error(j.error || text);
        } catch {
          throw new Error(text.slice(0, 400));
        }
      }

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Upload returned non-JSON response");
      }

      const src = json?.src;
      if (!src) throw new Error("Upload response missing 'src'");

      // Call the callback if provided
      onUploadFinish && onUploadFinish(src);
    } catch (err) {
      console.error("Upload failed:", err);
      // Optional: toast/snackbar here
    } finally {
      setIsUploading(false);
      abortRef.current = null;
    }
  }

  return (
    <FileDrop
      onDrop={uploadImage}
      onDragOver={() => setIsFileOver(true)}
      onDragLeave={() => setIsFileOver(false)}
      onFrameDragEnter={() => setIsFileNearby(true)}
      onFrameDragLeave={() => setIsFileNearby(false)}
      onFrameDrop={() => {
        setIsFileNearby(false);
        setIsFileOver(false);
      }}
    >
      <div className="relative">
        {(isFileNearby || isFileOver) && (
          <div className="bg-twitterBlue text-white absolute inset-0 flex items-center justify-center">
            drop your images here
          </div>
        )}
        {typeof children === "function"
          ? children({ isUploading })
          : children}
      </div>
    </FileDrop>
  );
}