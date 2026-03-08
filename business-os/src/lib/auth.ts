import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "./db";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const res = await query(
                    `SELECT * FROM system.users WHERE email = $1`,
                    [credentials.email]
                );

                const user = res.rows[0];

                if (!user) {
                    throw new Error("User not found");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

                if (!isPasswordValid) {
                    // Log failed attempt if needed in audit_logs
                    throw new Error("Invalid password");
                }

                // Create audit log for login
                await query(
                    `INSERT INTO system.audit_logs (company_id, user_id, action, entity) VALUES ($1, $2, 'login', 'auth')`,
                    [user.company_id, user.id]
                );

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    company_id: user.company_id,
                    is_primary_admin: user.is_primary_admin
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.company_id = user.company_id;
                token.is_primary_admin = user.is_primary_admin;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.company_id = token.company_id as string;
                session.user.is_primary_admin = token.is_primary_admin as boolean;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
