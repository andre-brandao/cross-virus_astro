<script lang="ts">
  // COMPONENTS
  import MapDragCharts from "./ChartMaps/DragSearchCharts.svelte";
  import PolygonChart from "./ChartMaps/PolygonSearchCharts.svelte";
  import SimpleMap from "./BaseMaps/SimpleMap.svelte";

  // TYPES
  import type { ArcgisFilter, ChartFiltered, LayerFilter } from "./types";
  import type { MapWrapperParams, SceneWrapperParams } from "./ChartMaps/types";
  import type { SimpleMapParams } from "./BaseMaps/types";

  export let dashboard_config: DashBoardParams;
  //   THIS COMPONENT ASSUMES MAP AND SCENE IDS REFERENCE THE SAME DATASET, SHARING CHARTS AND FILTERS
  interface DashBoardParams {
    title: string;
    map_id: string;
    scene_id: string;
    layerName: string;
    fieldNames: string[];
    charts: ChartFiltered[];
    feature_table?: {
      title: string;
      fields: {
        type: string;
        fieldName: string;
        label: string;
        direction?: "asc" | "desc";
      }[];
    };
    layer_filter?: LayerFilter[];
    // OTHER MAPS DO NOT HAVE CHARTS OR FILTERS SO THEY CAN USE ANY DATASET OR MAP
    other_maps?: {
      label: string;
      config: SimpleMapParams;
    }[];
  }

  let selected_map = "drag";

  const drag_search_config: MapWrapperParams = {
    mapID: dashboard_config.map_id,
    charts: dashboard_config.charts,
    options: {
      drag_filter: {
        fieldNames: dashboard_config.fieldNames,
        radius: 1,
      },
      feature_table: dashboard_config.feature_table,
      layer_filter: dashboard_config.layer_filter,
    },
  };

  const polygon_search_config: SceneWrapperParams = {
    mapID: dashboard_config.scene_id,
    charts: dashboard_config.charts,
    options: {
      filter: {
        fieldNames: dashboard_config.fieldNames,
        layerName: dashboard_config.layerName,
      },
    },
  };
</script>

<div class="w-full flex justify-between p-2 bg-gray-300">
  <p class="font-bold underline text-2xl">{dashboard_config.title}</p>
  <div class="border border-primary bg-white p-2 rounded">
    <label for="map-type">Selecione o Mapa</label>
    <select
      name="map-type"
      id="map-type"
      class=" hover:bg-gray-300 hover:border border-secondary"
      bind:value={selected_map}
    >
      <option value="drag">Arraste para buscar</option>
      {#if dashboard_config.scene_id}
        <option value="polygon">Desenhar Poligonos</option>
      {/if}
      {#each dashboard_config.other_maps ?? [] as simpleMapConfig}
        <option value={simpleMapConfig.config.mapID}
          >{simpleMapConfig.label}
        </option>
      {/each}
    </select>
  </div>
</div>

{#if selected_map === "drag"}
  <MapDragCharts map_config={drag_search_config} />
{:else if selected_map === "polygon"}
  <PolygonChart scene_config={polygon_search_config} />
{:else}
  <SimpleMap
    options={{
      mapID: selected_map,
    }}
  />
{/if}
