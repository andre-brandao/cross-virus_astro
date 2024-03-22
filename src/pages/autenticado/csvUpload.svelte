<script>
  let file;
  let parsedData = [];
  let campo_endereco = "";
  let nome_dataset = "";

  function onFileChange(event) {
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
        entry[header.trim()] = columns[index].trim();
        return entry;
      }, {});
    });
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
    formData.append("fileName", nome_dataset);

    try {
      const response = await fetch("/autenticado/uploadcsv", {
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
  <!-- else content here -->
  <main class="flex items-center justify-center">
    <div class="p-4">
      <div class="rounded p-2 m-2 bg-gray-200">
        <form on:submit|preventDefault={onFormSubmit}>
          <input
            id="fileName"
            name="fileName"
            type="text"
            bind:value={nome_dataset}
            required
            placeholder="Nome Data Set"
          />
          <label for="csv" class="block mb-2">CSV file</label>
          <input
            id="csv"
            name="csv"
            type="file"
            on:change={onFileChange}
            class="mb-4"
          />
          <label for="field">Campo Endereço</label>
          <input
            id="field"
            name="field"
            type="text"
            bind:value={campo_endereco}
            required
            readonly
          />

          <button
            type="submit"
            class="bg-blue-50 p-1 rounded-sm"
            disabled={!campo_endereco || !file}>Geocodificar</button
          >
        </form>
      </div>

      {#if parsedData.length > 0}
        <div class="w-screen overflow-auto max-h-[50vh]">
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
      {/if}
    </div>
  </main>
{/if}
