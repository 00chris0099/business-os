import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface User {
        id: string;
        role?: string;
        company_id?: string;
        is_primary_admin?: boolean;
    }

    interface Session {
        user: User & {
            id: string;
            role?: string;
            company_id?: string;
            is_primary_admin?: boolean;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role?: string;
        company_id?: string;
        is_primary_admin?: boolean;
    }
}
