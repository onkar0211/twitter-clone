// import mongoose from "mongoose";
// import {initMongoose} from "../../lib/mongoose";
// import User from "../../models/User";
// import {unstable_getServerSession} from "next-auth";
// import {authOptions} from "./auth/[...nextauth]";
// import Follower from "../../models/Follower";

// export default async function handle(req, res) {
//   await initMongoose();
//   const session = await unstable_getServerSession(req, res, authOptions);

//   if (req.method === 'PUT') {
//     const {username} = req.body;
//     await User.findByIdAndUpdate(session.user.id, {username});
//     res.json('ok');
//   }
//   if (req.method === 'GET') {
//     const {id,username} = req.query;
//     const user = id
//       ? await User.findById(id)
//       : await User.findOne({username});
//     const follow = await Follower.findOne({
//       source:session.user.id,
//       destination:user._id
//     });
//     res.json({user,follow});
//   }

// }



// pages/api/users.js
import mongoose from "mongoose";
import { initMongoose } from "../../lib/mongoose";
import User from "../../models/User";
import Follower from "../../models/Follower";

import { getServerSession } from "next-auth/next"; // ✅ stable for pages/api
import { authOptions } from "./auth/[...nextauth]";

const isId = (v) => typeof v === "string" && mongoose.Types.ObjectId.isValid(v);

export default async function handle(req, res) {
  await initMongoose();
  const session = await getServerSession(req, res, authOptions);

  try {
    if (req.method === "PUT") {
      if (!session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      let { username } = req.body || {};
      if (typeof username !== "string") {
        return res.status(400).json({ error: "username must be a string" });
      }
      username = username.trim();
      if (!username) {
        return res.status(400).json({ error: "username cannot be empty" });
      }

      // (Optional) simple format check
      const re = /^[a-zA-Z0-9_]{3,30}$/;
      if (!re.test(username)) {
        return res.status(400).json({ error: "Invalid username format" });
      }

      // (Optional) ensure uniqueness
      const taken = await User.findOne({
        _id: { $ne: session.user.id },
        username,
      }).lean();
      if (taken) return res.status(409).json({ error: "Username already taken" });

      const updated = await User.findByIdAndUpdate(
        session.user.id,
        { username },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) return res.status(404).json({ error: "User not found" });
      return res.json({ ok: true, user: updated });
    }

    if (req.method === "GET") {
      const { id, username } = req.query || {};

      if (id) {
        if (!isId(id)) return res.status(400).json({ error: "Invalid user id" });
      } else if (!username) {
        return res.status(400).json({ error: "Provide id or username" });
      }

      const user = id
        ? await User.findById(id).lean()
        : await User.findOne({ username }).lean();

      if (!user) return res.status(404).json({ error: "User not found" });

      let follow = null;
      if (session?.user?.id) {
        follow = await Follower.findOne({
          source: session.user.id,
          destination: user._id,
        })
          .lean()
          .exec();
      }

      return res.json({ user, follow });
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[/api/users] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
