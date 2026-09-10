import "maplibre-gl/dist/maplibre-gl.css";
import "./PlanesMap.css";
import { GeoJSONSource, Map, setWorkerUrl, Popup, type LngLatLike } from "maplibre-gl";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { PlaneBasic } from "../../types";
// import PlanePng from "../assets/plane.png";
import PlanePng from "../../assets/plane-1.png";
import { getBearing } from "./utils";
import { isPlaneFeature, type PlaneFeature } from "./types";
import { createPortal } from "react-dom";

setWorkerUrl(workerUrl);

interface PlanesMapProps {
  planes: PlaneBasic[];
  selectedPlaneId: string | null;
  onPlaneSelect: (planeId: string) => void;
  onPopupClose: () => void;
  selectedPlaneContent: React.ReactNode | null;
}

export const PlanesMap = ({
  planes,
  selectedPlaneId,
  onPlaneSelect,
  selectedPlaneContent,
  onPopupClose,
}: PlanesMapProps) => {
  const mapRef = useRef<Map>(null);
  const planesFeaturesRef = useRef<PlaneFeature[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const [popupContainerNode] = useState(() => document.createElement("div"));
  const [detailsPopup] = useState(
    () =>
      new Popup({
        maxWidth: "300px",
        className: "planes-map__popup",
        anchor: "top",
      }),
  );

  const selectPlane = useEffectEvent(onPlaneSelect);
  const closePopup = useEffectEvent(onPopupClose);

  useEffect(() => {
    mapRef.current = new Map({
      container: "planes-map", // container id
      style: "https://demotiles.maplibre.org/style.json", // style URL
      center: [0, 0], // starting position [lng, lat]
      zoom: 1, // starting zoom
      maplibreLogo: true,
    });

    const map = mapRef.current;

    map.loadImage(PlanePng).then((image) => {
      map.addImage("plane-svg", image.data, { sdf: true });
    });

    map.once("load", () => {
      map.addSource("planes-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "planes",
        source: "planes-data",
        type: "symbol",
        layout: {
          "icon-image": "plane-svg",
          "icon-size": 0.8,
          "icon-allow-overlap": true,

          // Heading rotation
          "icon-rotate": ["get", "heading"],
          "icon-rotation-alignment": "auto",
        },
        paint: {
          "icon-color": ["get", "color"],
        },
      });

      map.on("click", "planes", (e) => {
        const planeFeature = e.features?.[0];
        if (!planeFeature || !isPlaneFeature(planeFeature)) {
          return;
        }

        selectPlane(planeFeature.properties.planeId);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on("mouseenter", "planes", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.on("mouseleave", "planes", () => {
        map.getCanvas().style.cursor = "";
      });

      setIsMapReady(true);
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !selectedPlaneId) {
      return;
    }

    const selectedPlane = planes.find((plane) => plane.id === selectedPlaneId);

    if (!selectedPlane) {
      return;
    }

    detailsPopup.on("close", closePopup);

    const coordinates = [selectedPlane.longitude, selectedPlane.latitude];

    detailsPopup.setLngLat(coordinates as LngLatLike);

    if (!detailsPopup.isOpen()) {
      detailsPopup.setDOMContent(popupContainerNode);
      detailsPopup.addTo(map);
    }
  }, [selectedPlaneId, isMapReady, popupContainerNode, planes, detailsPopup]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) {
      return;
    }

    const updatePlanes = async () => {
      const planesSource = map.getSource<GeoJSONSource>("planes-data");
      if (!planesSource) {
        return;
      }

      const prevPlanes = planesFeaturesRef.current;

      const prevCoordinatesMap = prevPlanes.reduce<Record<string, number[]>>((acc, next) => {
        if (next.geometry.type === "Point") {
          acc[next.properties.planeId] = next.geometry.coordinates;
        }

        return acc;
      }, {});

      const planesFeatures: PlaneFeature[] = planes.map((plane) => {
        return {
          type: "Feature",
          properties: {
            planeId: plane.id,
            color: plane.color,
            altitude: plane.altitude,
            heading: prevCoordinatesMap[plane.id]
              ? getBearing(prevCoordinatesMap[plane.id], [plane.longitude, plane.latitude])
              : 0,
          },
          geometry: {
            type: "Point",
            coordinates: [plane.longitude, plane.latitude],
          },
        };
      });
      planesFeaturesRef.current = planesFeatures;

      planesSource.setData({
        type: "FeatureCollection",
        features: planesFeatures,
      });
    };

    updatePlanes();
  }, [planes, isMapReady]);

  return (
    <>
      <div id="planes-map" />
      {selectedPlaneId && createPortal(selectedPlaneContent, popupContainerNode)}
    </>
  );
};
