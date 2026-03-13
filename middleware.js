

import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function middleware(request) {

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/login')) {
    if (token) return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}