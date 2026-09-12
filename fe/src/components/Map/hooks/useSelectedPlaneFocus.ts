import { useEffectEvent, useEffect } from "react";
import type { Map } from "maplibre-gl";
import type { PlaneBasic } from "../../../types";

type useSelectedPlaneFocusOptions = {
  map: Pick<Map, "flyTo"> | null;
  selectedPlane: Pick<PlaneBasic, "id" | "longitude" | "latitude"> | undefined;
};

export const useSelectedPlaneFocus = ({ selectedPlane, map }: useSelectedPlaneFocusOptions) => {
  const planeId = selectedPlane?.id;

  const flyToSelectedPlane = useEffectEvent(() => {
    if (!map || !selectedPlane) {
      return;
    }

    map.flyTo({
      center: [selectedPlane.longitude, selectedPlane.latitude],
      zoom: 6,
      offset: [0, -250],
    });
  });

  useEffect(() => {
    if (planeId) {
      flyToSelectedPlane();
    }
  }, [planeId]);
};
