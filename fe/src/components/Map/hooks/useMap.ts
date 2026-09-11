import { useState, useEffect } from "react";
import { Map } from "maplibre-gl";

type UseMapOptions = {
  container: HTMLElement | null;
};

export const useMap = ({ container }: UseMapOptions): Map | null => {
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (!container) {
      return;
    }

    const mapInstance = new Map({
      container,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 0],
      zoom: 1,
      maplibreLogo: true,
    });

    mapInstance.once("load", () => {
      setMap(mapInstance);
    });

    return () => {
      mapInstance.remove();
    };
  }, [container]);

  return map;
};
