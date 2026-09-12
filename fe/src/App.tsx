import { useState } from "react";
import { PlanesMap } from "./components/Map/PlanesMap";
import { StatusPanel } from "./components/StatusPanel/StatusPanel";
import { DetailsPopup } from "./components/DetailsPopup/DetailsPopup";
import { usePlanes } from "./hooks/usePlanes";
import { usePlaneDetails } from "./hooks/usePlaneDetails";
import { PlanesListPanel } from "./components/PlanesListPanel/PlanesListPanel";

function App() {
  const [selectedPlaneId, setSelectedPlaneId] = useState<string | null>(null);

  const planesSource = usePlanes();
  const planeDetailsSource = usePlaneDetails({ planeId: selectedPlaneId });

  const handlePlaneSelect = (planeId: string) => {
    setSelectedPlaneId(planeId);
  };

  return (
    <>
      <PlanesMap
        planes={planesSource.planes}
        selectedPlaneId={selectedPlaneId}
        onPlaneSelect={handlePlaneSelect}
        selectedPlaneContent={
          planeDetailsSource.planeDetails ? (
            <DetailsPopup planeDetails={planeDetailsSource.planeDetails} />
          ) : null
        }
        onPopupClose={() => setSelectedPlaneId(null)}
      />
      <div className="fixed top-5 left-5 z-10 flex max-h-[calc(100dvh-2.5rem)] w-64 max-w-[calc(100vw-2.5rem)] flex-col gap-3">
        <StatusPanel
          connections={[
            { label: "Aircraft Locations", status: planesSource.status },

            {
              label: `Aircraft Details ${selectedPlaneId ? ` "${selectedPlaneId}"` : ""}`,
              status: planeDetailsSource.status,
            },
          ]}
        />
        <PlanesListPanel
          planes={planesSource.planes}
          selectedPlaneId={selectedPlaneId}
          onPlaneSelect={handlePlaneSelect}
        />
      </div>
    </>
  );
}

export default App;
