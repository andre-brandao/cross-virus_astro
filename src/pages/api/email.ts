import nodemailer from "nodemailer";
import type { APIRoute } from "astro";

export const prerender = false;
export const POST: APIRoute = async ({ params, request }) => {
  const body = await request.json(); // Parse the request body as JSON

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "admin@crossgeo.com.br",
      pass: "ascy nswn wguv maul",
    },
  });

  const mailOptions = {
    from: "admin@crossgeo.com.br",
    to: body.to, // Use the 'to' field from the request body
    subject: "Alerta Crossvirus",
    text: body.text, // Use the 'text' field from the request body
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }

  return new Response(JSON.stringify("Email sent successfully"), { status: 200 });
};
