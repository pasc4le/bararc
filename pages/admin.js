import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from 'layouts/Admin';
import supabase from 'lib/supabase';
import style from 'styles/pages/admin.module.css';
import { gradeToColor } from 'lib/utils';

export default function Admin() {
    const [trailheads, setTrailheads] = useState(null);
    const [currentTrailheads, setCurrentTrailheads] = useState(null);
    const allTrailheads = useRef(null);
    const searchTimeout = useRef(null);
    const [update, setUpdate] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase.from('trailheads').select();
            if (error) throw error;
            if (data) {
                setTrailheads(data.filter((v) => v?.approved == false));
                const approvedTrailheads = data.filter(
                    (v) => v?.approved == true
                );
                allTrailheads.current = approvedTrailheads;
                setCurrentTrailheads(approvedTrailheads);
            }
            setUpdate(false);
        };
        if (update) fetchData();
    }, [update]);

    const acceptReport = async (id) => {
        const { data, error } = await supabase
            .from('trailheads')
            .update({ approved: true })
            .match({ id });
        if (error) throw error;
        setUpdate(true);
        return data;
    };

    const denyReport = async (id) => {
        const { data, error } = await supabase
            .from('trailheads')
            .delete()
            .match({ id });
        if (error) throw error;
        setUpdate(true);
        return data;
    };

    const searchTrailhead = async (query) => {
        if (!allTrailheads.current) return;
        const Fuse = (await import('fuse.js')).default;
        const fuse = new Fuse(allTrailheads.current, {
            keys: ['name', 'address'],
            findAllMatches: true,
        });
        setCurrentTrailheads(fuse.search(query).map((v) => v.item));
        console.log(fuse.search(query).map((v) => v.item));
        console.log(allTrailheads.current);
    };

    const updateSelected = async (query) => {
        if (query == '') return setCurrentTrailheads(allTrailheads.current);
        // if (searchTimeout.current) clearTimeout(searchTimeout.current);
        // searchTimeout.current = setTimeout(async () => {
        //   await searchTrailhead(query);
        // }, 0);
        await searchTrailhead(query);
    };

    return (
        <main className={style.mainWrapper}>
            <div className={style.reportsWrapper}>
                <h2>Segnalazioni in Arrivo</h2>
                {trailheads?.length <= 0 && (
                    <p className={style.noNewReports}>
                        Non ci sono nuove segnalazioni :,(
                    </p>
                )}
                {trailheads &&
                    trailheads.map((v, i) => {
                        return (
                            <div className={style.reportBox} key={i}>
                                <img
                                    src={`/api/staticimage?lat=${v.lat}&lng=${v.lng}`}
                                    className={style.reportBoxImage}
                                />
                                <div className={style.reportBoxInfo}>
                                    <h3>
                                        <div
                                            className={style.reportBoxGrade}
                                            style={{
                                                background: gradeToColor(
                                                    v.grade
                                                ),
                                            }}
                                        >
                                            <img src={`/icons/${v.type}.png`} />
                                        </div>
                                        {v.name}
                                    </h3>
                                    <p className={style.reportBoxInfoAddress}>
                                        {v.address}
                                    </p>
                                    <p>{v.desc || 'Nessuna Descrizione'}</p>
                                    <div className={style.reportBoxButtons}>
                                        <button
                                            className={style.reportBoxDeny}
                                            onClick={() => denyReport(v.id)}
                                        >
                                            Rifiuta
                                        </button>
                                        <button
                                            className={style.reportBoxAccept}
                                            onClick={() => acceptReport(v.id)}
                                        >
                                            Accetta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                <div className={style.allTrailheadsHeading}>
                    <h2>Tutti i Segnaposti</h2>
                    <div className={style.searchBox}>
                        <input
                            type="text"
                            placeholder="Cerca"
                            onChange={(e) => updateSelected(e.target.value)}
                        />
                    </div>
                </div>
                {currentTrailheads
                    ? currentTrailheads.map((v, i) => (
                          <div className={style.reportBox} key={i}>
                              <img
                                  src={`/api/staticimage?lat=${v.lat}&lng=${v.lng}`}
                                  className={style.reportBoxImage}
                              />
                              <div className={style.reportBoxInfo}>
                                  <h3>
                                      <div
                                          className={style.reportBoxGrade}
                                          style={{
                                              background: gradeToColor(v.grade),
                                          }}
                                      >
                                          <img src={`/icons/${v.type}.png`} />
                                      </div>
                                      {v.name}
                                  </h3>
                                  <p className={style.reportBoxInfoAddress}>
                                      {v.address}
                                  </p>
                                  <p>{v.desc || 'Nessuna Descrizione'}</p>
                                  <div className={style.reportBoxButtons}>
                                      <button
                                          className={style.reportBoxDeny}
                                          onClick={() => denyReport(v.id)}
                                      >
                                          Elimina
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))
                    : 'Non ci sono risultati'}
            </div>
        </main>
    );
}

Admin.getLayout = (page) => {
    return <AdminLayout>{page}</AdminLayout>;
};
