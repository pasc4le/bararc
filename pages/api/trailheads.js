import { getTrailheads } from 'lib/map';

export default async function handler(req, res) {
  const { type } = req.query;

  const data = await getTrailheads(type);

  return res.status(200).send(data);
}
