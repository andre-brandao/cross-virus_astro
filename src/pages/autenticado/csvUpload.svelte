<script>
  export let municipio = {
    CodMun: 0,
    created_at: "",
    faixa_pop: "",
    nome: "",
    pop_est: 0,
    regiao: "",
    UF: "",
  };

  let file;
  let parsedData = [];
  let campo_endereco = "";
  let ano = "2024";
  let doenca = "Dengue";
  $: isformValid = file && campo_endereco && nome_dataset;

  let list_doencas = [
    "Dengue",
    "COVID-19",
    "Chikungunya",
    "Zika",
    "Leishmaniose",
  ];
  $: nome_dataset = `${ano} ${doenca} - ${municipio.UF} - ${municipio.nome}`;

  let isCarregando = false;
  function onFileChange(event) {
    isCarregando = true;
    file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      parseCsv(e.target.result);
    };
    reader.readAsText(file);
  }

  function parseCsv(csvData) {
    const lines = csvData.split("\n");
    const headers = lines[0].split(",");
    parsedData = lines.slice(1).map((line) => {
      const columns = line.split(",");
      return headers.reduce((entry, header, index) => {
        entry[header.trim()] = columns[index]?.trim();
        return entry;
      }, {});
    });
    isCarregando = false;
  }

  let isUploading = false;
  async function onFormSubmit() {
    isUploading = true;
    if (!file || !campo_endereco || !nome_dataset) {
      isUploading = false;
      console.log("Arquivo ou campo de endereço não fornecido");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file);
    formData.append("field", campo_endereco);
    formData.append("fileName", nome_dataset + '.csv');

    try {
      const response = await fetch("/autenticado/createMap", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Resultado da Geocodificação:", result);
      } else {
        console.error("Erro ao enviar arquivo:", await response.text());
      }
      isUploading = false;
    } catch (e) {
      console.error("Erro ao enviar arquivo:", e);
      isUploading = false;
    }
    isUploading = false;
  }
</script>

{#if isUploading}
  <main class="flex items-center justify-center h-screen">
    <div class="p-4">
      <div class="rounded p-2 m-2 bg-gray-200">
        <p>Enviando arquivo...</p>
      </div>

      <!-- spinner -->
      <div class="flex justify-center">
        <svg
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.001 8.001 0 014.708 4.708L7.291 7.29zm10.582 0a8.001 8.001 0 01-2.583 2.583l2.583 2.582z"
          ></path>
        </svg>
      </div>
    </div>
  </main>
{:else}
  <main class="flex items-center justify-center">
    <div class="p-4">
      <div class="flex justify-between">
        <h1 class="text-2xl font-bold">Criando Dataset CSV</h1>
        <h1 class="text-2xl font-bold">
          {nome_dataset}
        </h1>
      </div>
      <form
        method="post"
        on:submit|preventDefault={onFormSubmit}
        class="rounded sticky top-10 flex flex-col p-2 m-2 border shadow-lg bg-gray-100 {isformValid
          ? 'border-green-300'
          : 'border-secondary'}"
      >
        <div>
          <input
            type="hidden"
            class="hidden"
            value={`${municipio.nome} ${doenca} ${ano}.csv`}
          />
          <input
            id="csv"
            name="csv"
            type="file"
            on:change={onFileChange}
            class="border {!file ? 'bg-red-300' : 'border-green-300'}"
          />
          <label for="ano"> Ano: </label>
          <select
            name="ano"
            id="ano"
            bind:value={ano}
            class="border-2 border-green-300"
          >
            <option value="2024"> 2024 </option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
            <option value="2018">2018</option>
            <option value="2017">2017</option>
            <option value="2016">2016</option>
          </select>
          <label for="doenca"> Doença: </label>
          <select
            name="doenca"
            id="doenca"
            bind:value={doenca}
            class="border-2 border-green-300"
          >
            {#each list_doencas as d}
              <option value={d}>{d}</option>
            {/each}
            <option value="2024"> 2024 </option>
          </select>
        </div>

        <!--           
          <label for="field">Campo Endereço</label>
          <input
            id="field"
            name="field"
            type="text"
            bind:value={campo_endereco}
            required
            readonly
          /> -->
        <div
          class="border p-2 m-2 {!campo_endereco
            ? 'border-secondary'
            : ' border-green-400'}"
        >
          {#if parsedData.length > 0}
            <label for="field">Campo Endereço</label>
            <select
              name="field"
              id="field"
              bind:value={campo_endereco}
              required
            >
              {#each Object.keys(parsedData[0]) as header}
                <option value={header}>{header}</option>
              {/each}
            </select>
          {:else}
            <p>Carregue um arquivo para selecionar o campo de endereço</p>
          {/if}
        </div>

        <button
          type="submit"
          class="bg-green-300 p-1 rounded w-full disabled:bg-secondary disabled:opacity-70"
          disabled={!isformValid}>Geocodificar</button
        >
      </form>
    </div>
  </main>
{/if}

{#if isCarregando}
  <div class="flex items-center justify-center h-full">
    <div class="p-4">
      <div class="rounded p-2 m-2 bg-gray-200">
        <p>Carregando arquivo...</p>
      </div>
      <div class="flex justify-center">
        <svg
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.001 8.001 0 014.708 4.708L7.291 7.29zm10.582 0a8.001 8.001 0 01-2.583 2.583l2.583 2.582z"
          ></path>
        </svg>
      </div>
    </div>
  </div>
{/if}

{#if parsedData.length > 0}
  <div class="w-screen overflow-scroll h-[50vh] overflow-y-scroll">
    <table class="w-full text-left table-auto">
      <thead class="bg-gray-200 sticky top-0">
        <tr>
          {#each Object.keys(parsedData[0]) as header}
            <th
              class="px-4 py-2 border hover:bg-blue-300 cursor-pointer"
              on:click={() => (campo_endereco = header)}>{header}</th
            >
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each parsedData as row, i (i)}
          <tr>
            {#each Object.values(row) as value}
              <td class="px-4 py-2 border">{value}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
      ]
    </table>
  </div>
  <p class="text-center font-bold">
    Também é possivel clicar no campo do endereço
  </p>
{/if}
