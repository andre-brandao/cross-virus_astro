<script lang="ts">
    import type { Chart, ChartConfiguration } from "chart.js/auto";
    import PolygonScene from "./ScenePolygon.svelte";
    import SvChart from "../SVChart.svelte";
  
    import type {
      ChartFiltered,
      PolygonSearchParams,
      SceneWrapperParams,
    } from "../types.ts";
  
    export let mapConfig: SceneWrapperParams;
  
    const formated_mapConfig: PolygonSearchParams = {
      mapID: mapConfig.mapID,
      options: {
        widgets: mapConfig.options?.widgets,
        filter: {
          layerName: mapConfig.options?.filter?.layerName,
          fieldNames: mapConfig.options?.filter?.fieldNames ?? [],
          radius: mapConfig.options?.filter?.radius ?? 1,
          sql_filter: mapConfig.charts
            .map((chart) => chart.sql_filter)
            .reduce((acc, val) => acc.concat(val), []),
          where: mapConfig.options?.filter?.where,
        },
      },
    };
  
    let chartConfigs: ChartFiltered[] = mapConfig.charts;
  
    let chartsRef: Chart[] = [];
  
    function updateChart(chart: Chart, dataValues: any[]) {
      // console.log("updating chart", chart, dataValues);
  
      try {
        if (
          chart.config.data.datasets.length > 1 &&
          dataValues.length > 1 &&
          mapConfig.options?.filter?.where
        ) {
          const query_data = dataValues[0];
          const where_data = dataValues[1];
          // console.log(query_data, where_data);
  
          const first_value = dataValues[0].map(
            (_, i) => query_data[i] - where_data[i]
          );
          chart.config.data.datasets[0].data = first_value;
          chart.config.data.datasets[1].data = dataValues[1];
          // console.log(first_value, dataValues[1]);
        } else {
          chart.config.data.datasets[0].data = dataValues[0];
        }
        // chart.config.data.datasets[0].data = dataValues;
        chart.update();
      } catch (error) {
        console.error("Error updating chart", error);
      }
    }
  
    function handleQueryResults(e: CustomEvent<any>) {
      const results = e.detail;
      console.log("query results:", results);
  
      chartConfigs.forEach((chart, i) => {
        // console.log(chart);
  
        let data: any[] = chart.chart.data.datasets.map((dataset, i) => {
          if (results[i] === undefined) {
            return [];
          }
          return chart.sql_filter.map(
            (filter) => results[i][filter.outStatisticFieldName]
          );
        });
  
        // console.log("updating chart", chartsRef[i], data);
  
        updateChart(chartsRef[i], data);
      });
    }
  </script>
  
  <main class="flex max-md:flex-col">
    <PolygonScene options={formated_mapConfig} on:query_results={handleQueryResults} />
  
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
  