import axios from 'axios';

const get = async (endpoint, params) =>
  await axios
    .get(process.env.MB_API_URL + endpoint, {
      params: {
        access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        ...params,
      },
    })
    .then((r) => r.data)
    .catch((err) => {
      console.log(err);
      throw err;
    });

export async function queryGeocode(query) {
  if (!query) return;

  return await get(`/geocoding/v5/mapbox.places/${query}.json`, {
    country: 'IT',
  });
}
