import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import pool from '@/lib/db.js'
import bcrypt from 'bcryptjs'

export const authOptions = {   // ✅ exported named const
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        const result = await pool.query(
          'SELECT * FROM users WHERE username = $1',
          [credentials.username]
        )
        const user = result.rows[0]
        if (!user) return null
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!passwordMatch) return null
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
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      return session
    }
  }
}

const handler = NextAuth({

  providers: [
    CredentialsProvider({
      name: 'Credentials',

      async authorize(credentials) {

        const result = await pool.query(
          'SELECT * FROM users WHERE username = $1',
          [credentials.username]
        )

        const user = result.rows[0]

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) return null

        // RETURN USER WITH ROLE
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

  // ⭐ ADD THIS PART
  callbacks: {

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      session.user.role = token.role
      return session
    }

  }

})

export { handler as GET, handler as POST }