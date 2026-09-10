import { useState } from "react";
import { PlanesMap } from "./components/Map/PlanesMap";
import { StatusPanel } from "./components/StatusPanel/StatusPanel";
import { DetailsPopup } from "./components/DetailsPopup/DetailsPopup";
import { usePlanes } from "./hooks/usePlanes";
import { usePlaneDetails } from "./hooks/usePlaneDetails";

function App() {
  const [selectedPlaneId, setSelectedPlaneId] = useState<string | null>(null);

  const planesSource = usePlanes();
  const planeDetailsSource = usePlaneDetails();

  const handlePlaneSelect = (planeId: string) => {
    setSelectedPlaneId(planeId);
    planeDetailsSource.subscribe(planeId);
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
      <StatusPanel
        connections={[{ label: "Aircraft positions", status: planesSource.status }].concat(
          selectedPlaneId
            ? [
                {
                  label: `Aircraft details ${selectedPlaneId}`,
                  status: planeDetailsSource.status,
                },
              ]
            : [],
        )}
      />
    </>
  );
}

export default App;
