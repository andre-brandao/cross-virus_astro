<script lang="ts">
  import "@arcgis/core/assets/esri/themes/light/main.css";
  import MapView from "@arcgis/core/views/MapView";
  import WebMap from "@arcgis/core/WebMap";
  import Map from "@arcgis/core/Map";
  import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
  import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
  import LayerView from "@arcgis/core/views/layers/LayerView";
  import Widget from "@arcgis/core/widgets/Widget";
  // import View from "@arcgis/core/views/View.js";
  // import Draw from "@arcgis/core/views/draw/Draw.js";
  import FeatureTable from "@arcgis/core/widgets/FeatureTable";
  import type Layer from "@arcgis/core/layers/Layer";
  import CSVLayer from "@arcgis/core/layers/CSVLayer";

  import type { Action } from "svelte/action";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import type { ArcgisFilter, LayerFilter } from "../types";
  import Slider from "@arcgis/core/widgets/Slider";

  export let map_config: DragSearchMapParams;

  let raio = 1;
  const csvLayer = new CSVLayer({
    url: map_config.csv_url,
  });
  let layerView: LayerView;

  interface DragSearchMapParams {
    // map: WebMap | Map
    csv_url: string;

    options?: {
      drag_filter?: {
        sql_filter: ArcgisFilter[];
        where?: string;
      };
      layer_filter?: LayerFilter[];
    };
    // 'on:event': (e: CustomEvent<boolean>) => void;
  }
  let featureTable: FeatureTable;

  function createFeatureTable(view: MapView) {
    if (featureTable) {
      console.log("Feature table already created");
      return;
    }
    featureTable = new FeatureTable({
      view: view, // Required for feature highlight to work
      layer: csvLayer,
      visibleElements: {
        // Autocast to VisibleElements
        menuItems: {
          clearSelection: true,
          // refreshData: true,
          toggleColumns: true,
          selectedRecordsShowAllToggle: true,
          selectedRecordsShowSelectedToggle: true,
          zoomToSelection: true,
        },
      },
      tableTemplate: {
        // Autocast to TableTemplate
        // @ts-expect-error
        columnTemplates: csvLayer.fields,
      },
      container: "tableDiv",
    });
  }

  function createRaioSlider(view: MapView) {
    const sliderDiv = document.createElement("div");
    sliderDiv.style.width = "300px";
    const slider = new Slider({
      container: sliderDiv,
      min: 1,
      max: 10,
      steps: 1,
      visibleElements: {
        labels: true,
        rangeLabels: true,
      },
      precision: 0,
      labelFormatFunction: (value: number) => {
        return `${value} km`;
      },
      values: [raio],
    });
    slider.on("thumb-drag", (event: any) => {
      raio = event.value;
    });
    view.ui.add(slider, "bottom-left");
  }

  interface ArcgisEvents {
    "on:query_results": (e: CustomEvent<any>) => void;
  }
  const emit_query_results = (results: any) => {
    const result_values = results.map((res: any) => res.value);

    console.log("Resultados query:", result_values);

    dispatch("query_results", result_values);
  };

  // INIT ----------------------------------------
  const csv_map: Action<HTMLDivElement, undefined, ArcgisEvents> = (node) => {
    const map = new Map({ basemap: "streets-vector" });

    map.add(csvLayer);

    const view = new MapView({
      container: node,
      map: map,
      zoom: 4,
      // brazil
      center: [-55.491977, -10.836584],
      highlightOptions: {
        // @ts-expect-error green is a valid color
        color: "green",
        haloOpacity: 0.65,
        fillOpacity: 0.45,
      },
    });

    const drag_filter = map_config.options?.drag_filter;
    createFeatureTable(view);

    if (!drag_filter) {
      console.error("CSVMap: No drag filter provided");
      return;
    }

    initQueryStats(view);
    createRaioSlider(view);
    if (map_config.options?.layer_filter) {
      view.ui.add("layer-filter-wrap", "bottom-right");
    }
  };
  async function initQueryStats(view: MapView) {
    console.log(csvLayer);

    // csvLayer.outFields = map_config.fields;
    layerView = await view.whenLayerView(csvLayer);
    
    reactiveUtils
      .whenOnce(() => !layerView.updating)
      .then(() => {
        // Query layer view statistics as the user clicks
        // or drags the pointer across the view.
        // @ts-expect-error
        view.on(["click", "drag"], (event: any) => {
          // disables navigation by pointer drag
          event.stopPropagation();
          queryStatsOnDrag(view, event)
            .then(emit_query_results)
            .catch((error: any) => {
              if (error.name !== "AbortError") {
                console.error(
                  "Error querying statistics, problably a bad filter"
                );
                console.warn(error);
              }
            });
        });
      });
  }
  function queryFeatureLayer(layerView: LayerView, query: any) {
    // @ts-expect-error query is a valid method
    return layerView.queryFeatures(query).then(
      (response: any) => {
        const stats = response.features[0].attributes;
        return stats;
      },
      function (e: any) {
        console.error(e);
      }
    );
  }
  let highlightHandle: any = null;
  function highlightFeatures(layerView: LayerView, query: any) {
    // @ts-expect-error queryObjectIds is a valid method
    layerView.queryObjectIds(query).then(function (ids: any) {
      if (highlightHandle) {
        highlightHandle.remove();
        highlightHandle = null;
      }
      // @ts-expect-error highlight is a valid method
      highlightHandle = layerView.highlight(ids);
      if (featureTable) {
        featureTable.highlightIds.removeAll();

        featureTable.highlightIds.addMany(ids);
      }
    });
  }

  const queryStatsOnDrag = promiseUtils.debounce(
    (view: MapView, event: any) => {
      const filter = map_config.options?.drag_filter;

      if (!filter) {
        console.error("No filter found for this map");
        return;
      }
      // create a query object for the highlight and the statistics query

      const { sql_filter } = filter;

      // @ts-expect-error query is a valid method
      const query = layerView.layer.createQuery();
      query.geometry = view.toMap(event); // converts the screen point to a map point

      //  **** CONFIGURA RAIO
      query.distance = raio; // queries all features within raioC KM of the point
      query.units = "kilometers";

      // create a clone of the query object for the statistics query ArcgisFilter
      const statsQuery = query.clone();
      // add the stat definitions to the the statistics query object cloned earlier
      statsQuery.outStatistics = sql_filter;

      // execute the query for all features in the layer view
      const query_response = queryFeatureLayer(layerView, statsQuery);

      const { where } = filter;

      let where_query_response: any = null;
      if (where) {
        console.log("where clause for second dataset found", where);

        const whereStatsQuery = query.clone();
        whereStatsQuery.outStatistics = sql_filter;
        whereStatsQuery.where = where;

        where_query_response = queryFeatureLayer(layerView, whereStatsQuery);
      }
      // highlight all features within the query distance
      highlightFeatures(layerView, query);

      if (where_query_response) {
        return promiseUtils.eachAlways([query_response, where_query_response]);
      }
      // Return the promises that will resolve to each set of statistics
      return promiseUtils.eachAlways([query_response]);
    }
  );

  let selected_layer_filter: string | null = "";

  $: {
    if (selected_layer_filter && csvLayer) {
      console.log("Layer filter selected:", selected_layer_filter);
      // @ts-expect-error filter is a valid property
      csvLayer.filter = {
        where: selected_layer_filter,
      };

    } else if (csvLayer) {
      // @ts-expect-error filter is a valid property
      csvLayer.filter = null;
    }
  }
</script>

<!-- MAIN MAP -->
<main class="">
  <div class={"w-full h-[50vh] md:h-[45vh]"} use:csv_map on:query_results></div>

  <!-- TABLE -->
  <div class={"w-full h-[50vh] md:h-[45vh]"}>
    <div id="tableDiv" class="w-full h-full"></div>
  </div>
  <!-- END TABLE -->
  <!-- LAYER FILTER START -->

  {#if map_config.options?.layer_filter}
    <div
      id="layer-filter-wrap"
      class="bg-white p-2 rounded-md border border-primary"
    >
      <label for="layer-filter">Filtrar dados:</label>
      <select
        name="layer-filter"
        id="layer-filter"
        bind:value={selected_layer_filter}
      >
        <option value="">Sem filtro</option>
        {#each map_config.options.layer_filter as filter}
          <option value={filter.where}>{filter.label}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- END LAYER FILTER -->
</main>
<!-- END MAIN MAP -->
