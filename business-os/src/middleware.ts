import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    // Protect all dashboard routes, but not API routes (unless specified) or public static assets
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
