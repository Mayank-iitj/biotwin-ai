import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
