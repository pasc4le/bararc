import { queryGeocode } from './ps';
import supabase from './supabase';
import Ajv from 'ajv';
const ajv = new Ajv();

ajv.addKeyword('isNotEmpty', {
  type: 'string',
  validate: function (schema, data) {
    return typeof data === 'string' && data.trim() !== '';
  },
  errors: false,
});

const trailheadReport = {
  type: 'object',
  properties: {
    name: { type: 'string', isNotEmpty: true },
    address: { type: 'string', isNotEmpty: true },
    desc: { type: 'string' },
    grade: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      isNotEmpty: true,
    },
    type: { type: 'string', isNotEmpty: true },
  },
  required: ['name', 'address', 'grade', 'type'],
};

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
      address: v.address,
    },
  }));
  return result;
}

export async function postTrailheads(reportData) {
  const valid = ajv.validate(trailheadReport, reportData);
  if (!valid) throw 'Invalid data';
  const geocode = (await queryGeocode(reportData.address)).features;
  if (geocode?.length <= 0) throw 'Invalid Address';

  reportData.lat = geocode[0].center[1];
  reportData.lng = geocode[0].center[0];

  const { data, error } = await supabase
    .from('trailheads')
    .insert([reportData]);

  if (error) throw error;
  return data;
}
