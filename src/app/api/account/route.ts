import { headers } from "next/headers";
import { readVerifiedAccount } from "@/lib/supabase-user";

export async function GET() {
  const headerList = await headers();
  const account = await readVerifiedAccount(headerList.get("authorization"));
  if (!account) {
    return Response.json({ signedIn: false, isAdmin: false, email: null });
  }
  return Response.json({
    signedIn: true,
    isAdmin: account.isAdmin,
    email: account.email,
  });
}
