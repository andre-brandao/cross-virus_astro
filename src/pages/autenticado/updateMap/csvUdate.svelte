<script>
  export let map = {
    CodMun: 4311343,
    created_at: "string",
    created_by: "string",
    csv_url: "string",
    endereco: "string",
    fields: [""],
    id: 7,
    title: "string",
  };
  let file;
  let parsedData = [];
  let campo_endereco = "";

  $: nome_dataset = map.title;

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

  let isValidCSV = false;
  let erros = "";

  function parseCsv(csvData) {
    const lines = csvData.split("\n");
    const headers = lines[0].split(",");
    isValidCSV = true;
    erros = "";
    // headers.forEach(element => {
    //   if (!map.fields.includes(element)) {
    //     isValidCSV = false;
    //     erros+= "" + element + ","
    //   }
    // });
    map.fields.forEach((element) => {
      if (!headers.includes(element)) {
        if (
          element != "latitude" &&
          element != "longitude" &&
          element != "Latitude" &&
          element != "Longitude"
        ) {
          console.log("csv invalido");
          isValidCSV = false;
          erros += "" + element + ",";
        }
      }
    });

    if (erros) {
      isCarregando = false;
      return;
    } else {
    }

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
    console.log("Enviando arquivo...");
    isUploading = true;
    if (!file) {
      isUploading = false;
      console.log("Arquivo ou campo de endereço não fornecido");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file);
    formData.append("map_id", map.id);

    try {
      const response = await fetch(`/autenticado/updateMap/${map.id}`, {
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
        <h1 class="text-2xl font-bold">Update Dataset CSV</h1>
        <h1 class="text-2xl font-bold">
          {nome_dataset}
        </h1>
      </div>
      <form
        method="post"
        on:submit|preventDefault={onFormSubmit}
        class="rounded sticky top-10 flex flex-col p-2 m-2 border shadow-lg bg-gray-100 {!true
          ? 'border-green-300'
          : 'border-secondary'}"
      >
        <input
          id="csv"
          name="csv"
          type="file"
          on:change={onFileChange}
          class="border {!file ? 'bg-red-300' : 'border-green-300'}"
        />

        <button
          type="submit"
          class="bg-green-300 p-1 rounded w-full disabled:bg-secondary disabled:opacity-70"
          disabled={!isValidCSV && !isCarregando}>Geocodificar</button
        >
      </form>
      <div>
        ** O novo arquivo deve ter o formato
        <code class="bg-blue-200">
          {#each map.fields as item}
            <span>
              {item},
            </span>
          {/each}
        </code>
      </div>

      {#if erros}
        <code class="bg-red-300">
          O CSV não possui o campo: {erros}
        </code>
      {/if}

      <div>
        ** Campo endereco: {map.endereco}
      </div>
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
    </table>
  </div>
  <p class="text-center font-bold">
    Também é possivel clicar no campo do endereço
  </p>
{/if}
