import SettingsForm from "@/components/dashboard/setting/SettingsForm";
import { createSupabaseServerClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select(
      "name, description, location, opening_hours, phone, cover_image, avatar_url",
    )
    .eq("id", user.id)
    .single();

  return (
    <SettingsForm
      vendorId={user.id}
      initialVendor={
        vendor ?? {
          name: "",
          description: "",
          location: "",
          opening_hours: "",
          phone: "",
          cover_image: "",
          avatar_url: "",
        }
      }
    />
  );
}
