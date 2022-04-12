import supabase from './supabase';

export async function getTrailheadsData(type, approved = true) {
  const { data, error } = await supabase
    .from('trailheads')
    .select()
    .eq('approved', approved);

  if (error) throw error;
  return data;
}

export async function getTrailheads(type = 'all') {
  const result = {
    type: 'FeatureCollection',
  };
  const data = await getTrailheadsData(type);
  result.features = data.map((v, i) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [v.lng, v.lat],
    },
    properties: {
      grade: v.grade,
      'icon-type': v.type,
      title: v.name,
      geocode: v.geocode,
    },
  }));
  return result;
}
