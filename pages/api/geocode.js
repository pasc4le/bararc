import { queryGeocode } from 'lib/ps';

export default async function handler(req, res) {
    const { query } = req.query;
    if (!query) return res.status(400).end('Bad Request.');

    const data = await queryGeocode(query);

    if (data) return res.status(200).send(data);
    else return res.status(500).end('Internal Server Error.');
}
