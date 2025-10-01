import {initMongoose} from "../../lib/mongoose";
import Post from "../../models/Post";
import {unstable_getServerSession} from "next-auth";
import {authOptions} from "./auth/[...nextauth]";
import Like from "../../models/Like";
import Follower from "../../models/Follower";

export default async function handler(req, res) {
  await initMongoose();
  const session = await unstable_getServerSession(req,res,authOptions);

  if (req.method === 'GET') {
    const {id} = req.query;
    if (id) {
      const post = await Post.findById(id)
        .populate('author')
        .populate({
          path: 'parent',
          populate: 'author',
        });
      res.json({post});
    } else {
      const parent = req.query.parent || null;
      const author = req.query.author;
      let searchFilter;
      if (!author && !parent) {
        const myFollows = await Follower.find({source:session.user.id}).exec();
        const idsOfPeopleIFollow = myFollows.map(f => f.destination);
        searchFilter = {author:[...idsOfPeopleIFollow,session.user.id]};
      }
      if (author) {
        searchFilter = {author};
      }
      if (parent) {
        searchFilter = {parent};
      }
      const posts = await Post.find(searchFilter)
        .populate('author')
        .populate({
          path: 'parent',
          populate: 'author',
        })
        .sort({createdAt: -1})
        .limit(20)
        .exec();

      let postsLikedByMe = [];
      if (session) {
        postsLikedByMe = await Like.find({
          author:session.user.id,
          post:posts.map(p => p._id),
        });
      }
      let idsLikedByMe = postsLikedByMe.map(like => like.post);
      res.json({
        posts,
        idsLikedByMe,
      });
    }
  }

  if (req.method === 'POST') {
    const {text,parent,images} = req.body;
    const post = await Post.create({
      author:session.user.id,
      text,
      parent,
      images,
    });
    if (parent) {
      const parentPost = await Post.findById(parent);
      parentPost.commentsCount = await Post.countDocuments({parent});
      await parentPost.save();
    }
    res.json(post);
  }
}





/////////////////////////////////////////////
// pages/api/posts.js
// import { initMongoose } from "../../lib/mongoose";
// import Post from "../../models/Post";
// import Like from "../../models/Like";
// import Follower from "../../models/Follower";

// import { getServerSession } from "next-auth/next"; // correct for pages/api
// import { authOptions } from "./auth/[...nextauth]";

// import mongoose from "mongoose";

// export default async function handler(req, res) {
//   await initMongoose();

//   const session = await getServerSession(req, res, authOptions);
//   const isValidId = (v) =>
//     typeof v === "string" && mongoose.Types.ObjectId.isValid(v);

//   try {
//     if (req.method === "GET") {
//       const { id, parent: parentRaw, author: authorRaw } = req.query;

//       // GET /api/posts?id=...
//       if (id) {
//         if (!isValidId(id)) {
//           return res.status(400).json({ error: "Invalid post id" });
//         }

//         const post = await Post.findById(id)
//           .populate("author")
//           .populate({ path: "parent", populate: "author" })
//           .exec();

//         if (!post) return res.status(404).json({ error: "Post not found" });
//         return res.json({ post });
//       }

//       // Feed / listing
//       const parent = parentRaw && isValidId(parentRaw) ? parentRaw : undefined;
//       const author = authorRaw && isValidId(authorRaw) ? authorRaw : undefined;

//       let searchFilter = {};

//       if (author) {
//         searchFilter.author = author;
//       } else if (parent) {
//         searchFilter.parent = parent;
//       } else if (session?.user?.id) {
//         // Personalized feed: me + people I follow
//         const myFollows = await Follower.find({
//           source: session.user.id,
//         })
//           .lean()
//           .exec();
//         const idsOfPeopleIFollow = myFollows
//           .map((f) => f.destination)
//           .filter(Boolean);
//         searchFilter.author = {
//           $in: [...idsOfPeopleIFollow, session.user.id],
//         };
//       } // else leave {} for global feed

//       const posts = await Post.find(searchFilter)
//         .populate("author")
//         .populate({ path: "parent", populate: "author" })
//         .sort({ createdAt: -1 })
//         .limit(20)
//         .exec();

//       let idsLikedByMe = [];
//       if (session?.user?.id && posts.length) {
//         const likes = await Like.find({
//           author: session.user.id,
//           post: { $in: posts.map((p) => p._id) },
//         })
//           .lean()
//           .exec();
//         idsLikedByMe = likes.map((l) => String(l.post));
//       }

//       return res.json({ posts, idsLikedByMe });
//     }

//     if (req.method === "POST") {
//       if (!session?.user?.id) {
//         return res.status(401).json({ error: "Not authenticated" });
//       }

//       const { text, parent, images = [] } = req.body;

//       if (parent && !isValidId(parent)) {
//         return res.status(400).json({ error: "Invalid parent id" });
//       }

//       const post = await Post.create({
//         author: session.user.id,
//         text,
//         parent: parent || undefined,
//         images,
//       });

//       if (parent) {
//         const parentPost = await Post.findById(parent);
//         if (parentPost) {
//           parentPost.commentsCount = await Post.countDocuments({ parent });
//           await parentPost.save();
//         }
//       }

//       return res.status(201).json(post);
//     }

//     res.setHeader("Allow", ["GET", "POST"]);
//     return res.status(405).json({ error: "Method not allowed" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }