// import NextAuth from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
// import {MongoDBAdapter} from "@next-auth/mongodb-adapter";
// import clientPromise from "../../../lib/mongodb"
// import { getServerSession } from "next-auth/next";

// export const authOptions = {
//   adapter: MongoDBAdapter(clientPromise),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET
//     }),
//   ],
//   pages: {
//     signIn: '/login',
//   },
//   session: {
//     strategy: 'jwt',
//   },
//   callbacks: {
//     session: async ({token,session}) => {
//       if (session?.user && token?.sub) {
//         session.user.id = token.sub;
//       }
//       return session;
//     },
//   },
// };

// export default NextAuth(authOptions);



// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, 
  callbacks: {
    
    async jwt({ token, account, profile, user }) {
     
      return token;
    },
    async session({ session, token  }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub; 
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

//npx update-browserslist-db@latest
