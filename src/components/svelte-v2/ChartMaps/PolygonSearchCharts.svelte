<script lang="ts">
  import type SceneView from "@arcgis/core/views/SceneView";
  import type Widget from "@arcgis/core/widgets/Widget";
  import type { Chart, ChartConfiguration } from "chart.js/auto";

  //   COMOPONENTS
  import SvChart from "../SVChart.svelte";
  import PolygonSearch from "../BaseMaps/ScenePolygonSearch.svelte";
  //   TYPES
  import type { PolygonSearchParams } from "../BaseMaps/types";
  import type { ChartFiltered } from "../types.ts";
  import type { SceneWrapperParams } from "./types";

  export let scene_config: SceneWrapperParams;

  const formated_mapConfig: PolygonSearchParams = {
    mapID: scene_config.mapID,
    options: {
      widgets: scene_config.options?.widgets,
      filter: {
        layerName: scene_config.options?.filter?.layerName,
        fieldNames: scene_config.options?.filter?.fieldNames ?? [],
        sql_filter: scene_config.charts
          .map((chart) => chart.sql_filter)
          .reduce((acc, val) => acc.concat(val), []),
        where: scene_config.options?.filter?.where,
      },
    },
  };

  let chartConfigs: ChartFiltered[] = scene_config.charts;

  let chartsRef: Chart[] = [];

  function updateChart(chart: Chart, dataValues: any[]) {
    // console.log("updating chart", chart, dataValues);

    chart.config.data.datasets[0].data = dataValues;

    // chart.config.data.datasets[0].data = dataValues;
    chart.update();
  }

  function handleQueryResults(e: CustomEvent<any>) {
    const results = e.detail;
    console.log("query results:", results);

    chartConfigs.forEach((chart, i) => {
      // console.log(chart);
      // const data = results;
      console.log("results", results);
      const { sql_filter } = chart;

      const data = sql_filter.map((filter) => {
        return results[filter.outStatisticFieldName];
      });
      updateChart(chartsRef[i], data);
    });
  }
</script>

<main class="flex max-md:flex-col">
  <PolygonSearch
    mapConfig={formated_mapConfig}
    on:query_results={handleQueryResults}
  />

  <div class="border border-primary flex flex-wrap justify-center items-center">
    {#each chartConfigs as chart, i}
      {@const config = chart.chart}
      {@const width = chart.size?.width ?? 350}
      {@const height = chart.size?.height ?? 350}

      <div class="">
        <SvChart bind:chart={chartsRef[i]} {config} {width} {height} />
      </div>
    {/each}
  </div>
</main>
