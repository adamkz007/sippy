import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  const { pathname } = request.nextUrl

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/register", "/forgot-password", "/"]
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith("/api/auth")
  )

  // Auth pages - redirect to appropriate dashboard if already logged in
  if (token && (pathname === "/login" || pathname === "/register")) {
    // Check if superadmin
    if (token.role === "SUPERADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    
    // Check if user has staff profiles (cafe owner/staff)
    const staffProfiles = token.staffProfiles as any[] | undefined
    const hasStaffRole = staffProfiles && staffProfiles.length > 0
    
    if (hasStaffRole) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/home", request.url))
    }
  }

  // Superadmin routes - only for SUPERADMIN role
  const isSuperAdminRoute = pathname.startsWith("/admin")
  const isSuperAdminApiRoute = pathname.startsWith("/api/admin")
  
  if (isSuperAdminRoute || isSuperAdminApiRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    if (token.role !== "SUPERADMIN") {
      // Not a superadmin, redirect to appropriate location
      const staffProfiles = token.staffProfiles as any[] | undefined
      const hasStaffRole = staffProfiles && staffProfiles.length > 0
      
      if (hasStaffRole) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } else {
        return NextResponse.redirect(new URL("/home", request.url))
      }
    }
  }

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ["/dashboard", "/pos", "/orders", "/menu", "/customers", "/analytics", "/settings"]
  const customerRoutes = ["/home", "/explore", "/loyalty", "/profile"]
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isCustomerRoute = customerRoutes.some(route => pathname.startsWith(route))

  if (!token && (isProtectedRoute || isCustomerRoute)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Dashboard routes - only for staff/owners
  if (token && isProtectedRoute) {
    const staffProfiles = token.staffProfiles as any[] | undefined
    const hasStaffRole = staffProfiles && staffProfiles.length > 0
    
    if (!hasStaffRole && token.role !== "ADMIN" && token.role !== "SUPERADMIN") {
      // Not a staff member, redirect to customer app
      return NextResponse.redirect(new URL("/home", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, except /api/auth which we check above)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|order).*)",
  ],
}
