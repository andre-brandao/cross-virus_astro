import { supabase } from "../../../lib/supabase";
export const prerender = false;
// Outputs: /builtwith.json
export async function GET({ params, request }: any) {
  const uf_id = params.uf;

  const { data: municipios, error } = await supabase
    .from("municipios")
    .select("CodMun, nome")
    .eq("UF", uf_id);

  if (error) {
    console.error(error);
  }

  console.log(municipios);

  return new Response(JSON.stringify(municipios));
}
