import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import pool from '@/lib/db.js'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        // Fetch user from DB
        const result = await pool.query(
          'SELECT * FROM users WHERE username = $1',
          [credentials.username]
        )
        const user = result.rows[0]

        // User not found
        if (!user) {
          throw new Error("Invalid username or password.")
        }

        // Wrong password
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!passwordMatch) {
          throw new Error("Invalid username or password.")
        }

        // Account inactive — soft deleted by admin
        if (!user.is_active) {
          throw new Error("Account inactive. Contact your admin.")
        }

        // All good — return user object
        return {
          id: user.id,
          name: user.username,
          role: user.role
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id  // ← also store id for deactivatedBy feature
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.id = token.id  // ← expose id in session
      return session
    }
  }
}

const handler = NextAuth(authOptions)  // ← reuse authOptions, no duplication

export { handler as GET, handler as POST }