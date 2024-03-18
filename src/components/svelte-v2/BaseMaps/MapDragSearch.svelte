<script lang="ts">
  import "@arcgis/core/assets/esri/themes/light/main.css";
  import MapView from "@arcgis/core/views/MapView";
  import WebMap from "@arcgis/core/WebMap";
  // import Map from "@arcgis/core/Map";
  import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
  import * as promiseUtils from "@arcgis/core/core/promiseUtils.js";
  import LayerView from "@arcgis/core/views/layers/LayerView";
  import Widget from "@arcgis/core/widgets/Widget";
  // import View from "@arcgis/core/views/View.js";
  // import Draw from "@arcgis/core/views/draw/Draw.js";
  import FeatureTable from "@arcgis/core/widgets/FeatureTable";
  import type Layer from "@arcgis/core/layers/Layer";

  import type { Action } from "svelte/action";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import type { ArcgisFilter } from "../types";
  import type { DragSearchMapParams } from "./types";

  export let map_config: DragSearchMapParams;


  interface ArcgisEvents {
    "on:query_results": (e: CustomEvent<any>) => void;
  }
  const emit_query_results = (results: any) => {
    const result_values = results.map((res: any) => res.value);

    console.log("Resultados query:", result_values);

    dispatch("query_results", result_values);
  };

  function addWidgets(view: MapView) {
    // filter widget
    if (map_config.options?.layer_filter) {
      view.ui.add("layer-filter-wrap", "bottom-right");
    }

    // WIDGETS
    const widgets = map_config.options?.widgets;
    if (!widgets) {
      return;
    }
    const { topRight, topLeft, bottomLeft, bottomRight } = widgets;

    if (topRight) {
      view.ui.add(topRight(view), "top-right");
    }
    if (topLeft) {
      view.ui.add(topLeft(view), "top-left");
    }
    if (bottomLeft) {
      view.ui.add(bottomLeft(view), "bottom-left");
    }
    if (bottomRight) {
      view.ui.add(bottomRight(view), "bottom-right");
    }
  }

  let featureTable: FeatureTable;

  function createFeatureTable(view: MapView, layer: Layer) {
    const feature_table = map_config.options?.feature_table;
    if (!feature_table) {
      return;
    }
    if (featureTable) {
      console.log("Feature table already created");
      return;
    }
    if (!view) {
      console.error(
        "No layer found to create feature table or not initialized yet"
      );
      return;
    }
    const { title, fields } = feature_table;
    if (title) {
      layer.title = title;
    }
    featureTable = new FeatureTable({
      view: view, // Required for feature highlight to work
      // @ts-expect-error layer is a valid property
      layer: layer,
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
        columnTemplates: fields,
      },
      container: "tableDiv",
    });
  }
  let defaultMapLayerView: LayerView;
  const drag_search_map: Action<
    HTMLDivElement,
    DragSearchMapParams,
    ArcgisEvents
  > = (node, param: DragSearchMapParams) => {
    const { mapID, options } = param;

    const map = new WebMap({
      portalItem: {
        id: mapID, //"20707169c14c40f680518710e7f58723"
      },
    });

    const view = new MapView({
      container: node,
      map: map,
      highlightOptions: {
        // @ts-expect-error green is a valid color
        color: "green",
        haloOpacity: 0.65,
        fillOpacity: 0.45,
      },
    });

    addWidgets(view);

    // BUSCA ESTATISTICAS AO DESLIZAR

    if (options && options.drag_filter) {
      const { radius, sql_filter, fieldNames, where } = options.drag_filter;

      if (where) {
        console.log(
          "Extra where clause, charts with 2 datasets will receive Where:",
          where
        );
      }

      view.when().then(() => {
        // TODO SUPORT MULTIPLE LAYERS
        const layer = map.layers.getItemAt(0);
        // defaultMapLayer = layer;
        createFeatureTable(view, layer);

        // @ts-expect-error outFields is a valid property
        layer.outFields = fieldNames;
        view.whenLayerView(layer).then((layerView: LayerView) => {
          reactiveUtils
            .whenOnce(() => !layerView.updating)
            .then(() => {
              defaultMapLayerView = layerView;
              // Query layer view statistics as the user clicks
              // or drags the pointer across the view.
              // @ts-expect-error
              view.on(["click", "drag"], (event: any) => {
                // disables navigation by pointer drag
                event.stopPropagation();
                queryStatsOnDrag(view, layerView, event)
                  .then((e: any) => emit_query_results(e))
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
        });
      });
    }
  };

  let highlightHandle: any = null;

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
    (view: MapView, layerView: LayerView, event: any) => {
      const filter = map_config.options?.drag_filter;

      if (!filter) {
        console.error("No filter found for this map");
        return;
      }
      // create a query object for the highlight and the statistics query

      const { sql_filter, radius } = filter;

      // @ts-expect-error query is a valid method
      const query = layerView.layer.createQuery();
      query.geometry = view.toMap(event); // converts the screen point to a map point

      //  **** CONFIGURA RAIO
      query.distance = radius ?? 1; // queries all features within raioC KM of the point
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
    if (selected_layer_filter && defaultMapLayerView) {
      console.log("Layer filter selected:", selected_layer_filter);
      // @ts-expect-error filter is a valid property
      defaultMapLayerView.filter = {
        where: selected_layer_filter,
      };
    } else if (defaultMapLayerView) {
      // @ts-expect-error filter is a valid property
      defaultMapLayerView.filter = null;
    }
  }
  export let mapClass = map_config.options?.feature_table
    ? "w-full h-[50vh] md:h-[45vh]"
    : "w-full h-[50vh] md:h-[90vh]";
</script>

<!-- MAIN MAP -->
<main class="">
  <div class={mapClass} use:drag_search_map={map_config} on:query_results></div>

  <!-- TABLE -->
  {#if map_config.options?.feature_table}
    <div class={mapClass}>
      <div id="tableDiv" class="w-full h-full"></div>
    </div>
  {/if}
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
