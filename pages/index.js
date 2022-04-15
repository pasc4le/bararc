import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { ISCHIA_DATA } from 'lib/utils';
import { message } from 'react-message-popup';

/* Style */
import style from 'styles/pages/index.module.css';

/* Mapbox */
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const SDF_ICONS = ['store-icon'];

export default function Home({ isMobileView }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(ISCHIA_DATA.lng);
  const [lat, setLat] = useState(ISCHIA_DATA.lat);
  const [zoom, setZoom] = useState(isMobileView ? 11 : 12);
  const [openModal, setOpenModal] = useState(false);

  const submitForm = async () => {
    const data = {
      name: document.querySelector('#reportModal #name').value,
      address: document.querySelector('#reportModal #address').value,
      type: document.querySelector('#reportModal #type').value,
      desc: document.querySelector('#reportModal #desc').value,
      grade: document.querySelector('#reportModal #grade').value,
    };

    message.loading('Caricando...', 4000).then(async ({ destory }) => {
      await axios
        .post('/api/report', data)
        .then((r) => {
          destory();
          message.success('Segnalazione Inviata', 2000);
        })
        .catch((e) => {
          destory();
          message.error(e.response.data);
        });
    });
  };

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

      for (let i = 0; i < SDF_ICONS.length; i++)
        map.current.loadImage(`/icons/${SDF_ICONS[i]}.png`, (err, image) => {
          if (err) throw err;
          map.current.addImage(SDF_ICONS[i], image, { sdf: true });
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
          'circle-color': [
            'match',
            ['get', 'grade'],
            'low',
            'green',
            'medium',
            'yellow',
            'high',
            'red',
            'extreme',
            'blue',
            'black',
          ],
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
          'icon-image': ['get', 'icon-type'],
          'icon-size': 0.5,
          'icon-offset': [0, -1.5],
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
    <main className={style.mapWrapper}>
      <div ref={mapContainer} className={style.mapContainer} />
      <button
        className={style.reportButton}
        onClick={() => setOpenModal(!openModal)}
      >
        Segnala una Barriera Archiettonica
      </button>
      {openModal && (
        <div className={style.reportModalWrapper}>
          <div
            className={style.reportModalClose}
            onClick={() => setOpenModal(!openModal)}
          />
          <div className={style.reportModal} id="reportModal">
            <h3>Segnala una barriera</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ut
              diam ut dui mollis gravida venenatis eget enim. Nulla pretium
              pulvinar dolor at mattis. Vivamus at convallis risus.
            </p>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Inserisci l'indirizzo del luogo"
            />
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Inserisci il nome della struttura"
            />
            <textarea
              name="desc"
              id="desc"
              placeholder="Inserisci una breve descrizione"
            />
            <select name="grade" id="grade" placeholder="Grado di Importanza">
              <option value="low">Basso</option>
              <option value="medium">Medio</option>
              <option value="high">Alto</option>
            </select>
            <select name="type" id="type" placeholder="Tipo di Struttura">
              <option value="store-icon">Supermarket</option>
            </select>

            <button onClick={() => submitForm()}>Invia Modulo</button>
          </div>
        </div>
      )}
    </main>
  );
}
