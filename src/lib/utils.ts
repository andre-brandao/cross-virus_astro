import nodemailer from "nodemailer";

export async function sendEmail(to: string, text: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "admin@crossgeo.com.br",
      pass: "ascy nswn wguv maul",
    },
  });

  const mailOptions = {
    from: "admin@crossgeo.com.br",
    to: to, // Use the 'to' field from the request body
    subject: "Alerta Crossvirus",
    text: text, // Use the 'text' field from the request body
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: error,
    };
  }
  return {
    ok: true,
  };
}


export function getDistanceFromLatLonInKm(
  position1: { lat: number; lng: number },
  position2: { lat: number; lng: number }
) {
  var deg2rad = function (deg: number) {
      return deg * (Math.PI / 180);
    },
    R = 6371,
    dLat = deg2rad(position2.lat - position1.lat),
    dLng = deg2rad(position2.lng - position1.lng),
    a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(position1.lat)) *
        Math.cos(deg2rad(position1.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2),
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c * 1000).toFixed();
}