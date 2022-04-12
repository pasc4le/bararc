import axios from 'axios';

const get = async (endpoint, params) =>
  await axios
    .get(process.env.PS_API_URL + endpoint, {
      params: {
        access_key: process.env.PS_API_KEY,
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

  return await get('/forward', {
    query,
  });
}
