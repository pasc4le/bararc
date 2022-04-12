import React, { useRef, useEffect, useState } from 'react';

/* Style */
import style from 'styles/pages/index.module.css';

/* Mapbox */
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Home() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(13.907813);
  const [lat, setLat] = useState(40.729256);
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/peppedev/cl1vsfpxc002714pi7y12ex3c', // 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.once('load', () => {
      // This code runs once the base style has finished loading.

      map.current.loadImage('/imgs/shop-15.png', (err, image) => {
        if (err) throw err;
        map.current.addImage('store-icon', image, { sdf: true });
      });

      map.current.addSource('trailheads', {
        type: 'geojson',
        data: '/api/trailheads',
        cluster: true,
        clusterRadius: 20, // cluster two trailheads if less than 20 pixels apart
        clusterMaxZoom: 14,
      });

      map.current.addLayer({
        id: 'trailheads-circle',
        type: 'circle',
        source: 'trailheads',

        paint: {
          'circle-color': ['get', 'grade'],
          'circle-stroke-width': 0.5,
          'circle-stroke-color': 'white',
          'circle-radius': 10, // ['case', ['get', 'cluster'], 10, 10], // 10 pixels for clusters, 5 pixels otherwise
        },
      });

      map.current.addLayer({
        id: 'trailheads-symbols',
        type: 'symbol',
        source: 'trailheads',
        layout: {
          'icon-image': ['get', 'trailheadType'],
          'icon-size': 0.5,
        },
        paint: {
          'icon-color': 'white',
        },
      });

      map.current.addLayer({
        id: 'trailheads-cluster-count',
        type: 'symbol',
        source: 'trailheads',
        layout: {
          'text-font': ['Lato Bold'],
          'text-field': ['get', 'point_count'],
          'text-offset': [0, 0.1], // move the label vertically downwards slightly to improve centering
        },
        paint: {
          'text-color': 'white',
        },
      });
    });
  });

  return (
    <div>
      <div ref={mapContainer} className={style.mapContainer} />
    </div>
  );
}
