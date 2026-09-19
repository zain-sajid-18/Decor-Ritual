import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getOptionalSession } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin Sign In | ZF Store",
  description: "Secure administrator sign-in for ZF Store management.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getOptionalSession();
  if (session) {
    redirect("/admin");
  }

  const { from } = await searchParams;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
          >
            ZF Store
          </Link>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Admin Console
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Enter your credentials to access the catalog management dashboard.
          </p>
        </div>

        <LoginForm from={from} />

        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            ← Return to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
