import EditableImage from "./EditableImage";

export default function Avatar({src,big,onChange,editable=false}) {
  const widthClass = big ? 'w-24' : 'w-12';

  return (
    <div className='rounded-full overflow-hidden'>
      <EditableImage
        type={'image'}
        src={src}
        onChange={onChange}
        editable={editable}
        className={'rounded-full overflow-hidden ' + widthClass} />
    </div>
  );
}


// components/Avatar.js
// import React, { forwardRef } from "react";

// const Avatar = forwardRef(function Avatar(
//   { src, big = false, className = "", alt = "", ...rest },
//   ref
// ) {
//   const size = big ? 64 : 40; // adjust to your sizing
//   return (
//     <img
//       ref={ref}
//       src={src}
//       alt={alt}
//       width={size}
//       height={size}
//       className={`rounded-full object-cover ${className}`}
//       {...rest}
//     />
//   );
// });

// export default Avatar;
