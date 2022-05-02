/* Libs */
import { useEffect, useState } from 'react';
import { getCookie, setCookies } from 'cookies-next';

/* Style */
import style from 'styles/components/intro.module.css';

const slides_length = 5;

function Slide({ curr }) {
    switch (curr) {
        case 0:
            return (
                <div>
                    <h2>Benvenuto</h2>
                    <p>
                        Questo è il portale addetto alla segnalazione delle
                        barriere architettoniche sull'isola d'Ischia.
                    </p>
                </div>
            );
        default:
    }
}

export function Intro({ show, set }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const alreadyShown = getCookie('introShown');
        console.log(alreadyShown);

        if (alreadyShown) return;

        setCookies('introShown', 'true');
        set(true);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((currentSlide + 1) % slides_length);
    };

    return show ? (
        <section className={style.wrapper}>
            <div className={style.background} />
            <div className={style.presenter}>
                <Slide curr={currentSlide} />
            </div>
        </section>
    ) : null;
}
