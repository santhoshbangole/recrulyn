import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function NotFoundPage() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : undefined;
  const is404 = !error || status === 404;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbf9f4] px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#775a19]">
        {is404 ? "404" : "Error"}
      </p>
      <h1 className="mt-4 font-display text-4xl text-[#1b1c19] md:text-5xl">
        {is404 ? "Page not found" : "Something went wrong"}
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-7 text-[#6b7280]">
        {is404
          ? "This page doesn’t exist or the link is outdated. Head back to the platform or sign in to continue."
          : "An unexpected error occurred. Please try again or return home."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-xl border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-[#30312e]"
        >
          Go to Home
        </Link>
        <Link
          to="/login"
          className="rounded-xl border border-[#d9d7d2] bg-white px-6 py-3 text-sm font-medium text-[#1b1c19] transition hover:bg-[#f5f3ee]"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
