import 'styles/globals.css';
import 'animate.css';

function BarArcApp({ Component, pageProps, isMobileView }) {
    const getLayout = Component.getLayout || ((page) => page);

    return getLayout(<Component isMobileView={isMobileView} {...pageProps} />);
}

BarArcApp.getInitialProps = async ({ ctx }) => {
    const isMobileView = (
        ctx.req
            ? ctx.req.headers['user-agent']
            : typeof window !== 'undefined'
            ? navigator.userAgent
            : ''
    ).match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    );

    return {
        isMobileView: Boolean(isMobileView),
    };
};

export default BarArcApp;
