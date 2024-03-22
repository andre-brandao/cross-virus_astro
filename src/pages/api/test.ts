import { Email } from "../../lib/smtp";

import type { APIRoute } from "astro";

export const prerender = false;
// Outputs: /builtwith.json
export const GET: APIRoute = async ({ params, request }) => {
  const response = await Email.send({
    Host: "smtp.gmail.com",
    Username: "Admin@crossgeo.com.br",
    Password: "Obrigado3",
    To: "brandaoandre00@gmail.com",
    From: "suporte@crossgeo.com",
    Subject: "This is the subject",
    Body: "And this is the body",
  });

  return new Response(JSON.stringify(response));
};
