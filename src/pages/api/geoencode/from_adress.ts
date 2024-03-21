import type { APIRoute } from "astro";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { Client } from "@googlemaps/google-maps-services-js";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("csv");
  const addressField = formData.get("field")?.toString();

  if (!file || !(file instanceof File) || typeof addressField !== "string") {
    return new Response("Arquivo ou campo de endereço inválido", {
      status: 400,
    });
  }
  console.log(file, addressField);

  const csvContent = await file.text();
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const maps_client = new Client({});

  // Geocodifica cada endereço e armazena o resultado
  for (const record of records) {
    const address = record[addressField];

    if (address) {
      console.log(address);
      const result = await maps_client.geocode({
        params: {
          address: address,
          key: import.meta.env.GOOGLE_MAPS_KEY,
        },
      });

      const location = result.data.results[0]?.geometry.location;
      record["Latitude"] = location?.lat ?? null;
      record["Longitude"] = location?.lng ?? null;
    }
  }
  // console.log(records);

  // Converte os dados atualizados de volta para o formato CSV
  const updatedCsvContent = stringify(records, { header: true });

  // Retorna o CSV atualizado
  return new Response(updatedCsvContent, {
    headers: { "Content-Type": "text/csv" },
  });
};
