import { ISCHIA_DATA } from 'lib/utils';
import { requestStaticImage } from 'lib/ps';

export default async function handler(req, res) {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).end('Bad Request');
    const data = await requestStaticImage(
        lat,
        lng,
        11,
        ISCHIA_DATA.lat,
        ISCHIA_DATA.lng,
        '500x400'
    );

    res.setHeader('Content-Type', 'image/png');
    return res.send(data);
}
