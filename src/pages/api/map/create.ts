// ASTRO
import type { APIRoute } from "astro";
export const prerender = false; // Disable static rendering

// SUPABASE
import { supabase } from "../../../lib/supabase";
// MAPS GEO ENCODE
import { Client } from "@googlemaps/google-maps-services-js";
// CSV
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
export const POST: APIRoute = async ({ request, cookies, params }) => {
  // const accessToken = cookies.get("sb-access-token");
  // const refreshToken = cookies.get("sb-refresh-token");

  // if (!accessToken || !refreshToken) {
  //   return new Response("Session not found", { status: 401 });
  // }

  // const { data: data_auth, error } = await supabase.auth.setSession({
  //   refresh_token: refreshToken.value,
  //   access_token: accessToken.value,
  // });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const CodMun = session?.user?.user_metadata.municipio;

  const { data: municipio, error: error_municipio } = await supabase
    .from("municipios")
    .select("*")
    .eq("CodMun", CodMun)
    .single();

  if (error_municipio) {
    return new Response(
      "Erro ao obter seu municipio, contacte suporte crossvirus!",
      { status: 404 }
    );
  }

  console.log("form");
  const form = await request.formData();
  console.log(form);
  const csv = await form.get("csv");
  const campo_end = await form.get("campo_end");
  const ano = await form.get("ano");
  const doenca = await form.get("doenca");

  const fileName = `${municipio.nome}_${doenca}_${ano}.csv`;

  if (
    !csv ||
    !(csv instanceof File) ||
    typeof campo_end !== "string" ||
    typeof ano !== "string" ||
    typeof doenca !== "string"
  ) {
    return new Response("Dados inválidos, por favor preencha todos os campos", {
      status: 404,
    });
  }

  const csvContent = await csv.text();
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });
  const headers = Object.keys(records[0]);
  const maps_client = new Client({});

  if (!headers.includes(campo_end)) {
    return new Response("Campo de endereço não encontrado no arquivo", {
      status: 404,
    });
  }

  // Geocodifica cada endereço e armazena o resultado
  for (const record of records) {
    const address = record[campo_end];
    if (address) {
      console.log("Geocodificando" + address);
      try {
        const result = await maps_client.geocode({
          params: {
            address: address,
            key: import.meta.env.GOOGLE_MAPS_KEY,
          },
        });

        const location = result.data.results[0]?.geometry.location;
        record["latitude"] = location?.lat ?? null;
        record["longitude"] = location?.lng ?? null;
      } catch (e) {
        console.error(e);
        console.warn(`Erro ao geocodificar o endereço: ${address}`);
      }
    }
  }

  console.log("geocodificacao COMPLETA");

  const updatedCsvContent = stringify(records, {
    header: true,
    columns: Object.keys(records[0]),
  });
  const { data: storage_data, error: error_csv } = await supabase.storage
    .from("csv_maps")
    .upload(`${municipio.CodMun}/${fileName}`, updatedCsvContent);

  if (error_csv) {
    console.error(error_csv);
    return new Response(
      "Erro ao salvar o arquivo, provavelmente esse mapa ja existe \n Erro:" +
        error_csv.message,
      { status: 404 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("csv_maps").getPublicUrl(storage_data!.path);

  const { data: dataset_data, error: dataset_error } = await supabase
    .from("csv_dataset")
    .insert({
      title: `${municipio.nome} - ${doenca} - ${ano}`,
      csv_url: publicUrl,
      fields: headers,
      endereco: campo_end,
      CodMun: municipio.CodMun,
    }).select("*");

  if (dataset_error) {
    console.error(dataset_error);
    return new Response(
      "Erro ao salvar o dataset, contacte suporte crossvirus!",
      { status: 404 }
    );
  }
  return new Response(JSON.stringify(dataset_data), {
    status: 200,
  });
};
