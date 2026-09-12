import * as THREE from "three";
import { Map, MercatorCoordinate, type CustomLayerInterface } from "maplibre-gl";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useEffect, useEffectEvent } from "react";
import type { PlaneDetailed } from "../../../types";

type Options = {
  map: Map | null;
  plane: PlaneDetailed | null;
};

const LAYER_ID = "selected-plane-3d";
const MODEL_URL = "/models/plane.glb";
const MODEL_SCALE = 100;

// Initially plane nose looks up. Turn it 90deg, so it look forward
const HORIZONTAL_ORIENTATION = new THREE.Matrix4().makeRotationX(Math.PI / 2);
// Initially plane rotated south. Turn it 180deg, so by default it pointed north
const NORTH_ORIENTATION = new THREE.Matrix4().makeRotationZ(Math.PI);

const MODEL_ORIENTATION = NORTH_ORIENTATION.clone().multiply(HORIZONTAL_ORIENTATION);

export function usePlane3dLayer({ map, plane }: Options) {
  const getPlaneData = useEffectEvent(() => {
    if (!plane) {
      return null;
    }
    return {
      longitude: plane.longitude,
      latitude: plane.latitude,
      altitude: plane.altitude,
      heading: plane.heading,
      color: plane.color,
    };
  });

  useEffect(() => {
    if (!map) return;

    let model: THREE.Group | null = null;
    let renderer: THREE.WebGLRenderer | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const transform = new THREE.Matrix4();
    const headingRotation = new THREE.Matrix4();
    const scaleVector = new THREE.Vector3();

    scene.add(new THREE.AmbientLight(0xffffff, 2));

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, -1, 2);
    scene.add(light);

    const layer: CustomLayerInterface = {
      id: LAYER_ID,
      type: "custom",
      renderingMode: "3d",

      onAdd(_map, gl) {
        renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
        });
        renderer.autoClear = false;

        new GLTFLoader()
          .loadAsync(MODEL_URL)
          .then((gltf) => {
            model = gltf.scene;
            scene.add(model);
            map.triggerRepaint();
          })
          .catch((error) => {
            console.error("Plane model load failed:", error);
          });
      },

      render(_gl, args) {
        const planeData = getPlaneData();

        if (!planeData || !model || !renderer) {
          return;
        }

        // console.group();
        model.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;

          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((material) => {
            if (
              material instanceof THREE.MeshStandardMaterial ||
              material instanceof THREE.MeshPhongMaterial ||
              material instanceof THREE.MeshLambertMaterial ||
              material instanceof THREE.MeshBasicMaterial
            ) {
              // console.log({ material });
              if (material.name === "Material.001") {
                material.color.set(planeData.color);
              }
            }
          });
        });
        // console.groupEnd();

        const position = MercatorCoordinate.fromLngLat(
          [planeData.longitude, planeData.latitude],
          planeData.altitude,
        );

        const scale = position.meterInMercatorCoordinateUnits() * MODEL_SCALE;

        headingRotation.makeRotationZ(-THREE.MathUtils.degToRad(planeData.heading));

        transform
          .makeTranslation(position.x, position.y, position.z)
          .scale(scaleVector.set(scale, -scale, scale))
          .multiply(headingRotation)
          .multiply(MODEL_ORIENTATION);

        camera.projectionMatrix
          .fromArray(args.defaultProjectionData.mainMatrix)
          .multiply(transform);

        renderer.resetState();
        renderer.render(scene, camera);
      },

      onRemove() {
        scene.clear();
        renderer?.dispose();
      },
    };

    map.addLayer(layer);

    return () => {
      if (map.getLayer(LAYER_ID)) {
        map.removeLayer(LAYER_ID);
      }
    };
  }, [map]);
}
