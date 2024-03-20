<script>
    let file;
    let parsedData = [];
    let campo_endereco = "";
  
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
  
    async function onFormSubmit() {
      if (!file || !campo_endereco) {
        console.log('Arquivo ou campo de endereço não fornecido');
        return;
      }
  
      const formData = new FormData();
      formData.append('csv', file);
      formData.append('field', campo_endereco);
  
      const response = await fetch('/api/geoencode/from_adress', {
        method: 'POST',
        body: formData
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Resultado da Geocodificação:', result);
      } else {
        console.error('Erro ao enviar arquivo:', await response.text());
      }
    }
  </script>
  
  <main class="flex items-center justify-center">
    <div class="p-4">
      <div class="rounded p-2 m-2 bg-gray-200">
        <form on:submit|preventDefault={onFormSubmit}>
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
            readonly
          />
  
          <button
            type="submit"
            class="bg-blue-50 p-1 rounded-sm"
            disabled={!campo_endereco || !file}>Geocodificar</button>
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
                    on:click={() => (campo_endereco = header)}>{header}</th>
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
  