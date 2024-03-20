import type { APIRoute } from "astro";
import { parse } from "csv-parse/sync"; // Certifique-se de instalar esta biblioteca

export const POST: APIRoute = async ({ request }) => {
  // Recebe o arquivo CSV e o nome do campo contendo o endereço
  const formData = await request.formData();
  const file = formData.get("csv");
  const addressField = formData.get("field");

  console.log(file, typeof file);

  console.log(addressField);

  if (!file || !(file instanceof File) || typeof addressField !== "string") {
    return new Response("Arquivo ou campo de endereço inválido", {
      status: 400,
    });
  }

  // Lê e analisa o arquivo CSV
  const csvContent = await file.text();
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // Geocodifica cada endereço e coleta as coordenadas
  const results = await Promise.all(
    records.map(async (record) => {
      const address = record[addressField];
      const encodedAddress = encodeURIComponent(address);

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${
            import.meta.env.GOOGLE_MAPS_KEY
          }`
        );
        const data = await response.json();
        console.log("response google api", data);
        return {
          address,
          location: data.results[0]?.geometry.location,
        };
      } catch (error) {
        console.error(error);
        return {
          address,
          location: null,
          error: error.message,
        };
      }
    })
  );

  console.log(results);

  // Retorna as coordenadas geocodificadas
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
};
