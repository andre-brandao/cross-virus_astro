import { supabase } from "../../../lib/supabase";
import type { APIRoute } from "astro";

export const prerender = false;
// Outputs: /builtwith.json
export const GET: APIRoute = async ({ params, request }) => {
  const uf_id = params.uf;
  if (!uf_id) {
    return new Response("UF não informada", { status: 400 });
  }

  const { data: municipios, error } = await supabase
    .from("municipios")
    .select("CodMun, nome")
    .eq("UF", uf_id);

  if (error) {
    console.error(error);
  }

  console.log(municipios);

  return new Response(JSON.stringify(municipios));
};
