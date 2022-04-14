import axios from 'axios';

const get = async (endpoint, params, options) =>
  await axios
    .get(process.env.MB_API_URL + endpoint, {
      params: {
        access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        ...params,
      },
      ...options,
    })
    .then((r) => {
      return r.data;
    })
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

export async function requestStaticImage(
  lng,
  lat,
  zoom,
  clng,
  clat,
  size = '500x300',
  style = 'streets-v11'
) {
  return await axios
    .get(
      `${process.env.MB_API_URL}/styles/v1/mapbox/${style}/static/url-https%3A%2F%2Fdocs.mapbox.com%2Fapi%2Fimg%2Fcustom-marker.png(${lat},${lng})/${clat},${clng},${zoom}/${size}`,
      {
        params: {
          access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        },
        responseType: 'arraybuffer',
      }
    )
    .then((response) => Buffer.from(response.data, 'base64'));
}
