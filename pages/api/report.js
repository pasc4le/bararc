import { postTrailheads } from 'lib/map';

export default async function handler(req, res) {
  if (req.method != 'POST') return res.status(400).end('Bad Request');
  try {
    const data = await postTrailheads(req.body);
    return res.status(200).send(data);
  } catch (e) {
    return res.status(400).send(e);
  }
}
