import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { GENERAL_SETTINGS, gradeToColor, ISCHIA_DATA } from 'lib/utils';
import { message } from 'react-message-popup';
import Head from 'next/head';

/* Style */
import style from 'styles/pages/index.module.css';

/* Mapbox */
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Home({ isMobileView }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const [lng, setLng] = useState(ISCHIA_DATA.lng);
    const [lat, setLat] = useState(
        isMobileView ? ISCHIA_DATA.mlat : ISCHIA_DATA.lat
    );
    const [zoom, setZoom] = useState(isMobileView ? 11 : 12);
    const [openModal, setOpenModal] = useState(false);
    const [markerCoords, setMarkerCoords] = useState(null);
    const [markerData, setMarkerData] = useState(null);

    const submitForm = async () => {
        const data = {
            name: document.querySelector('#reportModal #name').value,
            address: document.querySelector('#reportModal #address').value,
            type: document.querySelector('#reportModal #type').value,
            desc: document.querySelector('#reportModal #desc').value,
            grade: document.querySelector('#reportModal #grade').value,
        };

        if (document.querySelector('#reportModal #position').checked) {
            data.lng = markerCoords[0];
            data.lat = markerCoords[1];
        }

        message.loading('Caricando...', 4000).then(async ({ destory }) => {
            await axios
                .post('/api/report', data)
                .then((r) => {
                    destory();
                    message.success('Segnalazione Inviata', 2000);
                })
                .catch((e) => {
                    destory();
                    message.error(
                        e.response.data || 'Si è verificato un errore'
                    );
                });
        });
    };

    useEffect(() => {
        if (
            !markerCoords ||
            !Array.isArray(markerCoords) ||
            markerCoords?.length < 2
        )
            return;

        const fetchData = async () => {
            const data = await axios
                .get(`/api/geocode?query=${markerCoords[0]},${markerCoords[1]}`)
                .then((r) => r.data);

            setMarkerData({
                name: data.features[0].text,
                address: data.features[0].place_name,
                toReport: true,
            });
        };

        fetchData();

        if (marker.current) {
            marker.current.setLngLat(markerCoords);
            return;
        }

        marker.current = new mapboxgl.Marker()
            .setLngLat(markerCoords)
            .addTo(map.current);
    }, [markerCoords]);

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
            Object.keys(GENERAL_SETTINGS.icons).forEach((v) => {
                map.current.loadImage(`/icons/${v}.png`, (err, image) => {
                    if (err) throw err;
                    map.current.addImage(v, image, { sdf: true });
                });
            });

            map.current.addSource('barriere', {
                type: 'geojson',
                data: '/api/trailheads',
                cluster: true,
                clusterRadius: 20, // cluster two trailheads if less than 20 pixels apart
                clusterMaxZoom: 14,
            });

            map.current.addLayer({
                id: 'trailheads-circle',
                type: 'circle',
                source: 'barriere',

                paint: {
                    'circle-color': [
                        'match',
                        ['get', 'grade'],
                        'low',
                        GENERAL_SETTINGS.typesColors.low,
                        'medium',
                        GENERAL_SETTINGS.typesColors.medium,
                        'high',
                        GENERAL_SETTINGS.typesColors.high,
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
                source: 'barriere',
                layout: {
                    'icon-image': ['get', 'icon-type'],
                    'icon-size': 0.25,
                },
                paint: {
                    'icon-color': 'white',
                },
            });

            map.current.on('click', (event) => {
                const bbox = [
                    [event.point.x - 5, event.point.y - 5],
                    [event.point.x + 5, event.point.y + 5],
                ];

                const selectedFeatures = map.current.queryRenderedFeatures(
                    bbox,
                    {
                        layers: ['trailheads-circle'],
                    }
                );

                if (selectedFeatures?.length > 0) {
                    const feature = selectedFeatures[0];
                    setMarkerData(feature.properties);
                } else setMarkerCoords([event.lngLat.lng, event.lngLat.lat]);
            });

            map.current.on('mouseenter', 'trailheads-circle', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.current.on('mouseleave', 'trailheads-circle', () => {
                map.current.getCanvas().style.cursor = '';
            });

            map.current.addLayer({
                id: 'trailheads-cluster-count',
                type: 'symbol',
                source: 'barriere',
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
            <Head>
                <title>Barriere Architettoniche Ischia</title>
            </Head>
            <div ref={mapContainer} className={style.mapContainer} />
            {!markerData && (
                <button
                    className={style.reportButton}
                    onClick={() => setOpenModal(!openModal)}
                >
                    Segnala una Barriera Archietettonica
                </button>
            )}
            {markerData && (
                <div
                    className={[
                        style.markerDataModal,
                        'animate__animated animate__slideInLeft animate__faster',
                    ].join(' ')}
                >
                    <h4>{markerData.name}</h4>
                    <p>{markerData.address}</p>
                    <p>{markerData.desc}</p>
                    {markerData?.grade && (
                        <p>
                            Classificazione:{' '}
                            <span
                                style={{
                                    color: gradeToColor(markerData?.grade),
                                }}
                            >
                                {GENERAL_SETTINGS.types[markerData.grade]}
                            </span>
                        </p>
                    )}
                    {(markerData?.type || markerData['icon-type']) && (
                        <p>
                            Tipo di Struttura:{' '}
                            <span>
                                {
                                    GENERAL_SETTINGS.icons[
                                        markerData?.type ||
                                            markerData['icon-type']
                                    ]
                                }
                            </span>
                        </p>
                    )}
                    {markerData.toReport && (
                        <button
                            className={style.reportButton}
                            onClick={() => setOpenModal(!openModal)}
                        >
                            Segnala
                        </button>
                    )}
                </div>
            )}
            {openModal && (
                <div className={style.reportModalWrapper}>
                    <div
                        className={style.reportModalClose}
                        onClick={() => setOpenModal(!openModal)}
                    />
                    <div
                        className={[
                            style.reportModal,
                            'animate__animated animate__slideInUp animate__faster',
                        ].join(' ')}
                        id="reportModal"
                    >
                        <h3>Segnala una barriera</h3>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Mauris ut diam ut dui mollis gravida venenatis
                            eget enim. Nulla pretium pulvinar dolor at mattis.
                            Vivamus at convallis risus.
                        </p>
                        <label htmlFor="address">Indirizzo</label>
                        <input
                            id="address"
                            name="address"
                            type="text"
                            placeholder="Inserisci l'indirizzo del luogo"
                            value={markerData?.address}
                            onChange={(e) => {
                                setMarkerData({
                                    ...markerData,
                                    address: e.target.value,
                                });
                            }}
                        />
                        <label htmlFor="name">Nome</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Inserisci il nome della struttura"
                            value={markerData?.name}
                            onChange={(e) => {
                                setMarkerData({
                                    ...markerData,
                                    name: e.target.value,
                                });
                            }}
                        />
                        <label htmlFor="desc">Descrizione</label>
                        <textarea
                            name="desc"
                            id="desc"
                            placeholder="Inserisci una breve descrizione"
                        />
                        <label htmlFor="grade">Classificazione Barriera</label>
                        <select
                            name="grade"
                            id="grade"
                            placeholder="Grado di Importanza"
                        >
                            {Object.keys(GENERAL_SETTINGS.types).map((v, i) => (
                                <option value={v} key={i}>
                                    {GENERAL_SETTINGS.types[v]}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="type">Tipo di Struttura</label>
                        <select
                            name="type"
                            id="type"
                            placeholder="Tipo di Struttura"
                        >
                            {Object.keys(GENERAL_SETTINGS.icons).map((v, i) => (
                                <option value={v} key={i}>
                                    {GENERAL_SETTINGS.icons[v]}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="position">Posizione dalla Mappa</label>
                        <input
                            type="checkbox"
                            name="position"
                            id="position"
                            disabled={!markerData}
                        />

                        <button onClick={() => submitForm()}>
                            Invia Modulo
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
