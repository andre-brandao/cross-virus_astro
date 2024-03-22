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

  import type { ArcgisFilter } from "../types";

  export let map_config: {
    csv_url: string;
  };

  const csvLayer = new CSVLayer({
    url: map_config.csv_url,
  });

  const drag_search_map: Action<HTMLDivElement> = (node) => {
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
  };
</script>

<!-- MAIN MAP -->
<main class="">
  <div class={"w-full h-[50vh] md:h-[90vh]"} use:drag_search_map></div>
</main>
<!-- END MAIN MAP -->
