import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {

  interface Session {

    user: {

      id: string;

      role: string;

      image?: string | null;

      isBanned: boolean;

      banExpires?: string | null;

      banReason?: string | null;

    } & DefaultSession["user"];

  }



  interface User {

    role: string;

    image?: string | null;

    isBanned: boolean;

    banExpires?: Date | null;

    banReason?: string | null;

  }

}
