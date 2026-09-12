import { useEffectEvent, useEffect } from "react";
import type { Map } from "maplibre-gl";
import type { PlaneBasic } from "../../../types";

type useSelectedPlaneFocusOptions = {
  map: Map | null;
  selectedPlane: Pick<PlaneBasic, "id" | "longitude" | "latitude"> | null;
};

export const useSelectedPlaneFocus = ({ selectedPlane, map }: useSelectedPlaneFocusOptions) => {
  const planeId = selectedPlane?.id;

  const flyToSelectedPlane = useEffectEvent(() => {
    if (!map || !selectedPlane) {
      return;
    }

    map.flyTo({
      center: [selectedPlane.longitude, selectedPlane.latitude],
      zoom: 8,
      pitch: Math.min(70, Math.max(45, map.getPitch())),
      offset: [0, -250],
    });
  });

  useEffect(() => {
    if (planeId) {
      flyToSelectedPlane();
    }
  }, [planeId]);
};
