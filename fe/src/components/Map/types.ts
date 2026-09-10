import type { Feature, FeatureCollection, Point } from "geojson";

type PlaneFeatureProperties = {
  planeId: string;
  color: string;
  altitude: number;
  heading: number;
};

export type PlaneFeature = Feature<Point, PlaneFeatureProperties>;

export type PlaneFeatureCollection = FeatureCollection<Point, PlaneFeatureProperties>;

export function isPlaneFeature(feature: Feature): feature is PlaneFeature {
  return !!(feature.properties && "planeId" in feature.properties);
}
