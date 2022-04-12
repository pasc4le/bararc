export async function getTrailheads(type = 'all') {
  const data = {
    type: 'FeatureCollection',
  };
  switch (type) {
    default:
      data.features = Array.from({ length: 20 }, (v, k) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            13.88 + Math.random() * 0.05,
            40.71 + Math.random() * 0.025,
          ],
        },
        properties: {
          grade: Math.random() > 0.5 ? 'red' : 'blue',
          trailheadType: 'store-icon',
        },
      }));
  }

  return data;
}
