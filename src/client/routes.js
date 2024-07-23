import React, { Suspense } from 'react';
import { Routes, Route, useParams, useLocation } from 'react-router-dom';

import View from './pages/View';
import NotFound from './pages/NotFound';

const FallBackLoadingContent = () => {
  return <div className='text-muted' style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", fontSize: "1.25rem" }}>
    Loading Content…
  </div>
}

export default function RenderRoutes(props) {
  return (
    <Suspense fallback={<FallBackLoadingContent />}>
      <Routes>
        <Route path='/' exact element={< ValidatePath period='now' />}></Route>
        <Route path='/:year/:month/:day' element={< ValidatePath period='day' />}></Route>
        <Route path='/:year/:month' element={< ValidatePath period='month' />}></Route>
        <Route path='/:year' element={< ValidatePath period='year' />}></Route>
        <Route path='*' element={<NotFound />}></Route>
      </Routes>
    </Suspense>
  );
}

function ValidatePath(props) {
  const params = useParams();
  const location = useLocation();
  let period = props.period;

  // Validation Here
  let valid = true
  if (params.year && (!params.year.match(/^[0-9]{4}$/) && !params.year.match(/^([0-9]{4}-[0-9]{1,2}-[0-9]{1,2},?){2}$/)))
    valid = false
  if (params.month && !params.month.match(/^[0-9]{1,2}$/))
    valid = false
  if (params.day && !params.day.match(/^[0-9]{1,2}$/))
    valid = false
  if (params.day === '')
    valid = true

  if (params.year && params.year.match(/^([0-9]{4}-[0-9]{1,2}-[0-9]{1,2},?){2}$/))
    period = 'range'

  if (valid)
    return <View path={location.pathname} period={period} />
  return <NotFound />
}
