import React, { Suspense } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import 'leaflet/dist/leaflet.css';

import RenderRoutes from './routes';

import HeaderContainer from './components/Main/HeaderContainer'
import FooterContainer from './components/Main/FooterContainer'

function App() {
    return (
        <Suspense fallback={<h1>Loading App...</h1>}>
            <HeaderContainer locationName='Lansing, MI' />
            <RenderRoutes />
            <FooterContainer />
        </Suspense>
    );
}

export default App;
