import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // console.log(' Middleware triggered for:', pathname);

    const protectedRoutes = [
        { path: '/admin', role: 'admin' },
        { path: '/content-admin', role: 'content_admin' },
        { path: '/instructor', role: 'instructor' },
    ];

    const matchedRoute = protectedRoutes.find((route) => pathname.startsWith(route.path));

    if (!matchedRoute) {
        // console.log(' No protected route matched');
        return NextResponse.next();
    }

    // console.log(' Protected route matched:', matchedRoute);

    const userRole = request.cookies.get('user-role')?.value;
    const accessToken = request.cookies.get('sb-access-token')?.value;

    // console.log(' User role from cookie:', userRole);
    // console.log(' Access token exists:', !!accessToken);

    if (!accessToken || !userRole) {
        // console.log(' No token or role - redirecting to login');
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // User doesn't have the required role for this route
    if (userRole !== matchedRoute.role) {
        // console.log(` Role mismatch! User has "${userRole}" but needs "${matchedRoute.role}"`);

        let redirectPath = '/';

        if (userRole === 'admin') {
            redirectPath = '/admin';
        } else if (userRole === 'content_admin') {
            redirectPath = '/content-admin';
        } else if (userRole === 'instructor') {
            redirectPath = '/instructor';
        }

        // console.log(' Redirecting to:', redirectPath);
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // console.log(' Access granted');
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/content-admin/:path*', '/instructor/:path*'],
};

// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export async function middleware(request: NextRequest) {
//     const { pathname } = request.nextUrl;

//     const protectedRoutes = [
//         { path: '/admin', role: 'admin' },
//         { path: '/content-admin', role: 'content_admin' },
//         { path: '/instructor', role: 'instructor' },
//     ];

//     const matchedRoute = protectedRoutes.find((route) => pathname.startsWith(route.path));

//     if (!matchedRoute) {
//         return NextResponse.next();
//     }

//     const userRole = request.cookies.get('user-role')?.value;
//     const accessToken = request.cookies.get('sb-access-token')?.value;

//     if (!accessToken || !userRole) {
//         const loginUrl = new URL('/login', request.url);
//         loginUrl.searchParams.set('redirect', pathname);
//         return NextResponse.redirect(loginUrl);
//     }

//     if (userRole !== matchedRoute.role) {
//         let redirectPath = '/';

//         if (userRole === 'admin') {
//             redirectPath = '/admin';
//         } else if (userRole === 'content_admin') {
//             redirectPath = '/content-admin';
//         } else if (userRole === 'instructor') {
//             redirectPath = '/instructor';
//         }

//         return NextResponse.redirect(new URL(redirectPath, request.url));
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: [
//         '/admin/:path*',
//         '/content-admin/:path*',
//         '/instructor/:path*',
//     ],
// };
