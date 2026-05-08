export const flyToDestination = (map: google.maps.Map, lat: number, lng: number) => {
  if (!map) return;
  
  // First, pan to the location at current zoom
  map.panTo({ lat, lng });

  // Then, after a short delay, zoom in and tilt for the cinematic effect
  setTimeout(() => {
    map.moveCamera({
      center: { lat, lng },
      zoom: 15,
      tilt: 45,
      heading: 0,
    });
  }, 500);

  // Final zoom in for detail
  setTimeout(() => {
    map.moveCamera({
      zoom: 17,
      tilt: 60,
    });
  }, 1500);
};
