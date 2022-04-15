import { useState, useEffect } from 'react';
import { AdminLayout } from 'layouts/Admin';
import supabase from 'lib/supabase';
import style from 'styles/pages/admin.module.css';
import { gradeToColor } from 'lib/utils';

export default function Admin() {
  const [trailheads, setTrailheads] = useState(null);
  const [update, setUpdate] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('trailheads')
        .select()
        .eq('approved', false);
      if (error) throw error;
      if (data) setTrailheads(data);
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
                        background: gradeToColor(v.grade),
                      }}
                    >
                      <img src={`/icons/${v.type}.png`} />
                    </div>
                    {v.name}
                  </h3>
                  <p className={style.reportBoxInfoAddress}>{v.address}</p>
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
      </div>
    </main>
  );
}

Admin.getLayout = (page) => {
  return <AdminLayout>{page}</AdminLayout>;
};
