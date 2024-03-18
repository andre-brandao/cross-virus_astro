<script lang="ts">
  let estados: string[] = [
    "MG",
    "SP",
    "RJ",
    "ES",
    "BA",
    "RS",
    "SC",
    "PR",
    "GO",
    "DF",
    "MS",
    "MT",
    "RO",
    "AC",
    "AM",
    "RR",
    "PA",
    "AP",
    "TO",
    "MA",
    "PI",
    "CE",
    "RN",
    "PB",
    "PE",
    "AL",
    "SE",
  ];

   let estado_selecionado = "";


  let municipios: any[] = [];

  async function getMunicipios(uf: string) {
    const response = await fetch(`/api/municipios/${uf}`);
    const data = await response.json();

    console.log(data);

    municipios = data;
  }

  $: {
    if (estado_selecionado) {
      getMunicipios(estado_selecionado);
    }
  }
</script>

<div>
  <!-- <label
      for="municipio"
      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >Seu municipio:</label
    >
    <input
      type="text"
      name="municipio"
      id="municipio"
      class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="Belo Horizonte"
      required=""
    /> -->

  <label
    for="estado"
    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
  >
    Estado
  </label>
  <select
    name="estado"
    id="estado"
    bind:value={estado_selecionado}
    class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  >
    <option value="">Selecione o Estado</option>
    {#each estados as estado}
      <option value={estado}>{estado}</option>
    {/each}
  </select>
</div>

<div>
  <label
    for="municipio"
    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
  >
    Município
  </label>
  <select
    disabled={municipios.length === 0 || !estado_selecionado}
    name="municipio"
    id="municipio"
    required
    class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  >
    {#each municipios ?? [] as municipio}
      <option value={municipio.CodMun}>{municipio.nome}</option>
    {/each}
  </select>
</div>
