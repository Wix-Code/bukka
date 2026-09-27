// import { type NextRequest, NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";

// const PROTECTED_PREFIXES = ["/dashboard"];
// const AUTH_PAGES = ["/login", "/register"];

// export async function middleware(request: NextRequest) {
//   let response = NextResponse.next({ request });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) =>
//             request.cookies.set(name, value),
//           );
//           response = NextResponse.next({ request });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             response.cookies.set(name, value, options),
//           );
//         },
//       },
//     },
//   );

//   // Required even though we don't use the result directly — this call is
//   // what refreshes an expiring session and writes the new cookies via
//   // setAll above, so Server Components see up-to-date auth state.
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const { pathname } = request.nextUrl;
//   const isProtected = PROTECTED_PREFIXES.some((prefix) =>
//     pathname.startsWith(prefix),
//   );
//   const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

//   if (isProtected && !user) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/login";
//     url.searchParams.set("redirectTo", pathname);
//     return NextResponse.redirect(url);
//   }

//   if (isAuthPage && user) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/dashboard";
//     url.searchParams.delete("redirectTo");
//     return NextResponse.redirect(url);
//   }

//   return response;
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PAGES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Required even though we don't use the result directly — this call is
  // what refreshes an expiring session and writes the new cookies via
  // setAll above, so Server Components see up-to-date auth state.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------
  // Admin area — separate from the vendor dashboard entirely. Being
  // logged in isn't enough; the user's id also has to exist in `admins`.
  // ---------------------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    const isAdminLoginPage = pathname === "/admin/login";

    if (!user) {
      if (isAdminLoginPage) return response;
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    const { data: adminRow } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = Boolean(adminRow);

    if (isAdminLoginPage) {
      if (isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin-dashboard";
        url.searchParams.delete("redirectTo");
        return NextResponse.redirect(url);
      }
      return response;
    }

    if (!isAdmin) {
      // Logged in, but not an admin — a real vendor account, most likely.
      // Send them somewhere that actually makes sense for them.
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return response;
  }

  // ---------------------------------------------------------------------
  // Vendor dashboard + auth pages
  // ---------------------------------------------------------------------
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("redirectTo");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};