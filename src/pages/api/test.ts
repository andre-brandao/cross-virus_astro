import { Email } from "../../lib/smtp";
import nodemaiiler from "nodemailer";

import type { APIRoute } from "astro";

export const prerender = false;
export const GET: APIRoute = async ({ params, request }) => {
  const transporter = nodemaiiler.createTransport({
    service: "gmail",
    auth: {
      user: "admin@crossgeo.com.br",
      pass: "ascy nswn wguv maul",
    },
  });

  const mailOptions = {
    from: "admin@crossgeo.com.br",
    to: "brandaoandre00@gmail.com",
    subject: "Teste",
    text: "Teste",
  };

  try {
    transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error));
  }

  return new Response(JSON.stringify("response"));
};
