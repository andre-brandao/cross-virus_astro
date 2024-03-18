import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();

  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const municipio = formData.get("municipio")?.toString();

  if (!email || !password || !municipio) {
    return new Response("Email and password are required", { status: 400 });
  }
  console.log(formData);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        municipio,
      },
    },
  });

  if (error) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }

  return redirect("/login");
};
