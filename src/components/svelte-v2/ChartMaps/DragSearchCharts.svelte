<script lang="ts">
  import type { Chart, ChartConfiguration } from "chart.js/auto";
  import type MapView from "@arcgis/core/views/MapView";
  import Widget from "@arcgis/core/widgets/Widget";
  
  //  COMOPONENTS
  import MapDrag from "../BaseMaps/MapDragSearch.svelte";
  import SvChart from "../SVChart.svelte";
  //   TYPES
  import type { ArcgisFilter, ChartFiltered, LayerFilter } from "../types.ts";
  import type {
    DragSearchMapParams,
    MapWidgetCreator,
  } from "../BaseMaps/types.ts";
  import type { MapWrapperParams } from "./types.ts";

  export let map_config: MapWrapperParams;


  const formated_mapConfig: DragSearchMapParams = {
    mapID: map_config.mapID,
    options: {
      widgets: map_config.options?.widgets,
      drag_filter: {
        fieldNames: map_config.options?.drag_filter?.fieldNames ?? [],
        // radius: map_config.options?.drag_filter?.radius ?? 1,
        sql_filter: map_config.charts
          .map((chart) => chart.sql_filter)
          .reduce((acc, val) => acc.concat(val), []),
        where: map_config.options?.drag_filter?.where,
      },
      feature_table: map_config.options?.feature_table,
      layer_filter: map_config.options?.layer_filter,
    },
  };

  let chartConfigs: ChartFiltered[] = map_config.charts;

  let chartsRef: Chart[] = [];

  function updateChart(chart: Chart, dataValues: any[]) {
    // console.log("updating chart", chart, dataValues);

    try {
      if (
        chart.config.data.datasets.length > 1 &&
        dataValues.length > 1 &&
        map_config.options?.drag_filter?.where
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

    chartConfigs.forEach((chart_config, i) => {
      // console.log(chart);

      let data: any[] = chart_config.chart.data.datasets.map((dataset, i) => {
        if (results[i] === undefined) {
          return [];
        }
        return chart_config.sql_filter.map(
          (filter) => results[i][filter.outStatisticFieldName]
        );
      });

      // console.log("updating chart", chartsRef[i], data);

      updateChart(chartsRef[i], data);
    });
  }
</script>

<main class="flex max-md:flex-col">
  <div class="w-2/3">
    <MapDrag
      map_config={formated_mapConfig}
      on:query_results={handleQueryResults}
    />
  </div>

  <div class="w-1/3 flex flex-wrap justify-center items-center">
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
