import type { GeoJSONSource, Map, MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useEffectEvent, useState } from "react";
import { isPlaneFeature, type PlaneFeatureCollection } from "../types";
import type { PlaneBasic } from "../../../types";
import { toPlaneFeatureCollection } from "../utils/toPlaneFeatureCollection";

type UsePlanesLayerOptions = {
  map: Map | null;
  planeIconUrl: string;
  planes: PlaneBasic[];
  onPlaneClick: (planeId: string) => void;
};

const PLANE_ICON_NAME = "plane-icon";
const PLANES_LAYER_ID = "planes-layer";
const PLANES_SOURCE_ID = "planes-source";

const INITIAL_SOURCE_DATA: PlaneFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export const usePlanesLayer = ({
  map,
  planeIconUrl,
  planes,
  onPlaneClick,
}: UsePlanesLayerOptions): void => {
  const notifyPlaneClicked = useEffectEvent(onPlaneClick);
  const [isPlaneImageReady, setIsPlaneImageReady] = useState(false);

  // Plane icon loader, we cant add layer until image is ready and registered in map
  useEffect(() => {
    if (!map) {
      return;
    }

    map.loadImage(planeIconUrl).then((image) => {
      map.addImage(PLANE_ICON_NAME, image.data, { sdf: true });
      setIsPlaneImageReady(true);
    });

    return () => {
      map.removeImage(PLANE_ICON_NAME);
    };
  }, [map, planeIconUrl]);

  useEffect(() => {
    if (!map || !isPlaneImageReady) {
      return;
    }

    map.addSource(PLANES_SOURCE_ID, {
      type: "geojson",
      data: INITIAL_SOURCE_DATA,
    });

    map.addLayer({
      id: PLANES_LAYER_ID,
      source: PLANES_SOURCE_ID,
      type: "symbol",
      layout: {
        "icon-image": PLANE_ICON_NAME,
        "icon-size": 0.8,
        "icon-allow-overlap": true,

        // Heading rotation
        // "icon-rotate": ["get", "heading"],
        // "icon-rotation-alignment": "auto",
      },
      paint: {
        "icon-color": ["get", "color"],
      },
    });

    const handlePlaneClick = (event: MapLayerMouseEvent) => {
      const planeFeature = event.features?.[0];
      if (!planeFeature || !isPlaneFeature(planeFeature)) {
        return;
      }

      notifyPlaneClicked(planeFeature.properties.planeId);
    };

    const handlePlaneMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handlePlaneMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", PLANES_LAYER_ID, handlePlaneClick);
    map.on("mouseenter", PLANES_LAYER_ID, handlePlaneMouseEnter);
    map.on("mouseleave", PLANES_LAYER_ID, handlePlaneMouseLeave);

    return () => {
      map.off("mouseenter", PLANES_LAYER_ID, handlePlaneMouseEnter);
      map.off("mouseleave", PLANES_LAYER_ID, handlePlaneMouseLeave);
      map.off("click", PLANES_LAYER_ID, handlePlaneClick);

      map.removeLayer(PLANES_LAYER_ID);
      map.removeSource(PLANES_SOURCE_ID);
    };
  }, [map, isPlaneImageReady]);

  useEffect(() => {
    if (!map) {
      console.warn("[usePlanesLayer] map is null");
      return;
    }
    const source = map.getSource<GeoJSONSource>(PLANES_SOURCE_ID);
    if (!source) {
      console.warn("[usePlanesLayer] planes source not found");
      return;
    }

    source.setData(toPlaneFeatureCollection(planes));
  }, [map, planes]);
};
