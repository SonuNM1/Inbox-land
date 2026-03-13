// app/api/auth/[...nextauth]/route.js
// This file handles all auth routes automatically
// NextAuth catches all /api/auth/* requests here

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import pool from '@/lib/db.js'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',

      async authorize(credentials) {
        // Look up user in database by username
        const result = await pool.query(
          'SELECT * FROM users WHERE username = $1',
          [credentials.username]
        )

        const user = result.rows[0]

        // If no user found, reject login
        if (!user) return null

        // Compare entered password with hashed password in db
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        // If password wrong, reject login
        if (!passwordMatch) return null

        // Return user object on success
        return { id: user.id, name: user.username }
      }
    })
  ],

  // Use JWT strategy for sessions
  session: { strategy: 'jwt' },

  // Custom login page path
  pages: { signIn: '/login' },

  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }