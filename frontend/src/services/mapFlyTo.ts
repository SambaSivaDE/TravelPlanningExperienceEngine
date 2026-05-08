export const flyToDestination = (map: google.maps.Map, lat: number, lng: number) => {
  if (!map) return;
  
  const targetCamera = {
    center: { lat, lng },
    zoom: 16,
    tilt: 60,
    heading: 0,
  };

  // Animate the camera
  map.moveCamera(targetCamera);
};
