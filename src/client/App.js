import React, { Suspense } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import 'leaflet/dist/leaflet.css';

import RenderRoutes from './routes';

import HeaderContainer from './components/Main/HeaderContainer'
import FooterContainer from './components/Main/FooterContainer'

const FallBackLoadingApp = () => {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "1.25rem" }}>
        Loading Application…
    </div>
}

function App() {
    return (
        <Suspense fallback={<FallBackLoadingApp />}>
            <HeaderContainer locationName={document.head.querySelector('meta[name="geo.placename"]').content || ""} />
            <RenderRoutes />
            <FooterContainer />
        </Suspense>
    );
}

export default App;
