import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import { createSupabaseServerClient } from "@/lib/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user && !error) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
