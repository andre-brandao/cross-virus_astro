import type { APIRoute } from "astro";

export const prerender = false;
export const GET: APIRoute = async ({ params, request }) => {
  const csv_req = await fetch(
    "https://ggueyaykipybplpopegl.supabase.co/storage/v1/object/public/csv_maps/3100401/teste_api"
  );

  const csv = await csv_req.text();
  console.log(csv);

  return new Response(JSON.stringify(csv), {
    status: 200,
  });
};
