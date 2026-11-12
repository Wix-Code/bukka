import SettingsForm from "@/components/dashboard/setting/SettingsForm";
import { createSupabaseServerClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: vendor, error } = await supabase
    .from("vendors")
    .select(
      `
      name,
      description,
      location,
      opening_hours,
      phone,
      cover_image,
      avatar_url,
      has_dine_in,
      country,
      state,
      lga,
      city,
      street_address
    `,
    )
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Failed to fetch vendor settings:", error);
  }

  return (
    <SettingsForm
      vendorId={user.id}
      initialVendor={{
        name: vendor?.name ?? "",
        description: vendor?.description ?? "",
        location: vendor?.location ?? "",
        opening_hours: vendor?.opening_hours ?? "",
        phone: vendor?.phone ?? "",
        cover_image: vendor?.cover_image ?? "",
        avatar_url: vendor?.avatar_url ?? "",
        has_dine_in: vendor?.has_dine_in ?? false,

        country: vendor?.country ?? "Nigeria",
        state: vendor?.state ?? "",
        lga: vendor?.lga ?? "",
        city: vendor?.city ?? "",
        street_address: vendor?.street_address ?? "",
      }}
    />
  );
}
