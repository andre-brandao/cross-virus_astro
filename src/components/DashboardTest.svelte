<script lang="ts">
  import PolygonChart from "./svelte/PolygonSearch/ScenePolygonCharts.svelte";
  import DragChart from "./svelte/DragSearch/MapDragCharts.svelte";
  import type {
    ArcgisFilter,
    MapWrapperParams,
    SceneWrapperParams,
  } from "./svelte/types";

  // 0f9670330f6d4cdda508fd926e59f0c8

  let select_value = "drag";

  let mapId = "0f9670330f6d4cdda508fd926e59f0c8";

  //   onStatisticField:
  //    "CASE WHEN CLASSIFICACAO_FINAL = 'Confirmado' THEN 1 ELSE 0 END",
  //         outStatisticFieldName: "casos_confirmados",
  //         statisticType: "sum",

  let filter_sem_epi: ArcgisFilter[] = Array(10)
    .fill(undefined)
    .map((_, i) => {
      const semana = i + 1;
      return {
        onStatisticField: `CASE WHEN SEMANA_EPI = ${semana} THEN 1 ELSE 0 END`,
        outStatisticFieldName: "sem_epi" + semana,
        statisticType: "sum",
      };
    });

  let filter_idade: ArcgisFilter[] = [
    {
      onStatisticField: "CASE WHEN IDADE = '< 1 Ano' THEN 1 ELSE 0 END",
      outStatisticFieldName: "age_1_under",
      statisticType: "sum",
    },
    {
      onStatisticField:
        "CASE WHEN IDADE = '1 a 4 Anos' OR IDADE = '5 a 9 Anos' OR IDADE = '10 a 14 anos' THEN 1 ELSE 0 END",
      outStatisticFieldName: "age_1_14",
      statisticType: "sum",
    },
    {
      onStatisticField:
        "CASE WHEN IDADE= '15 a 19 Anos' OR IDADE = '20 a 29 Anos' THEN 1 ELSE 0 END",
      outStatisticFieldName: "age_15_29",
      statisticType: "sum",
    },
    {
      onStatisticField: "CASE WHEN IDADE = '30 a 39 Anos' THEN 1 ELSE 0 END",
      outStatisticFieldName: "age_30_39",
      statisticType: "sum",
    },
    {
      onStatisticField: "CASE WHEN IDADE LIKE '%40%' THEN 1 ELSE 0 END",
      outStatisticFieldName: "age_40_59",
      statisticType: "sum",
    },
    {
      onStatisticField:
        "CASE WHEN IDADE = 'Idosos (mais de 60 Anos)' THEN 1 ELSE 0 END",
      outStatisticFieldName: "age_60_over",
      statisticType: "sum",
    },
  ];

  let charts = [
    {
      chart: {
        type: "bar",
        data: {
          labels: [
            "sem_epi0",
            "sem_epi1",
            "sem_epi2",
            "sem_epi3",
            "sem_epi4",
            "sem_epi5",
            "sem_epi6",
            "sem_epi7",
            "sem_epi8",
            "sem_epi9",
          ],
          datasets: [
            {
              label: "Casos Notificados",
              backgroundColor: "#149dcf",
              stack: "Stack 0",
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
          ],
        },
        options: {
          responsive: false,
          legend: {
            position: "top",
          },
        },
      },
      sql_filter: filter_sem_epi,
    },
    {
      chart: {
        type: "bar",
        data: {
          labels: [
            "0 a 1",
            "1 a 4",
            "5 a 14",
            "15 a 29",
            "30 a 39",
            "40 a 59",
            "60 ou mais",
          ],
          datasets: [
            {
              label: "Idade",
              backgroundColor: "#149dcf",
              stack: "Stack 0",
              data: [0, 0, 0, 0, 0, 0, 0],
            },
          ],
        },
      },
      sql_filter: filter_idade,
    },
    // febre
    {
      chart: {
        type: "doughnut",
        data: {
          labels: ["FEBRE = 1", "FEBRE = 2"],
          datasets: [
            {
              backgroundColor: ["#149dcf", "#ed5050"],
              borderColor: "rgb(255, 255, 255)",
              borderWidth: 1,
              data: [0, 0],
            },
          ],
        },
        options: {
          responsive: false,
          cutoutPercentage: 35,
          legend: {
            position: "bottom",
          },
          title: {
            display: true,
            text: "Comorbidades",
          },
        },
      },
      sql_filter: [
        {
          onStatisticField: "CASE WHEN FEBRE = 1 THEN 1 ELSE 0 END",
          outStatisticFieldName: "febre_sim",
          statisticType: "sum",
        },
        {
          onStatisticField: "CASE WHEN FEBRE = 2 THEN 1 ELSE 0 END",
          outStatisticFieldName: "febre_nao",
          statisticType: "sum",
        },
      ],
      size:{
        width: 200,
        height: 200
      }
    },
  ];

  let mapDrad: MapWrapperParams = {
    mapID: mapId,
    options: {
      filter: {
        fieldNames: ["SEMANA_EPI", "IDADE", "FEBRE"],
        radius: 1,
        // sql_filter: filter_sem_epi,
        // where: "CLASSIFICACAO_FINAL = 'Confirmado'"
      },
    },
    charts,
  };

  let scenePoly: SceneWrapperParams = {
    mapID: "ffcd919361a342ce85a28f6c48dd02ac",
    options: {
      filter: {
        fieldNames: ["SEMANA_EPI", "IDADE"],
        layerName: "dengue24ok",
        radius: 1,
        // sql_filter: filter_sem_epi,
        // where: "CLASSIFICACAO_FINAL = 'Confirmado'"
      },
    },
    charts,
  };
</script>

<div class="w-full flex justify-between p-2 bg-gray-200">
  <p class="font-bold underline text-2xl">Dengue 2024 João Monlevade</p>
  <div class="bg-primary p-2">
    <label for="map-type">Tipo de Mapa</label>
    <select name="map-type" id="map-type" bind:value={select_value}>
      <option value="drag">Arraste para buscar</option>
      <option value="polygon">Desenhar Poligonos</option>
    </select>
  </div>
</div>

{#if select_value === "drag"}
  <DragChart mapConfig={mapDrad} />
{:else if select_value === "polygon"}
  <PolygonChart mapConfig={scenePoly} />
{/if}
