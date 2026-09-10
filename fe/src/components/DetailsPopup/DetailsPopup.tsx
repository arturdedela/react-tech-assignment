import type { PlaneDetailed } from "../../types";

type DetailsPopupProps = {
  planeDetails: PlaneDetailed;
};

export function DetailsPopup({ planeDetails }: DetailsPopupProps) {
  return (
    <div>
      <h1>{planeDetails.model}</h1>
      <p>{planeDetails.airline}</p>
      <p>{planeDetails.flightNumber}</p>
      <p>{planeDetails.registration}</p>
    </div>
  );
}
