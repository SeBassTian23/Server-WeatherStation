import React, { Suspense } from 'react';
import { Routes, Route, useParams, useLocation } from 'react-router-dom';

import Current from './pages/Current';
import Past from './pages/Past';
import NotFound from './pages/NotFound';

export default function RenderRoutes(props) {
  return (
    <Suspense fallback={<h1>Loading Content...</h1>}> 
      <Routes>
        <Route path='/' exact element={<Current path='/' />}></Route>
        <Route path='/:year/:month/:day' element={< ValidatePath />}></Route>
        <Route path='/:year/:month' element={< ValidatePath />}></Route>
        <Route path='/:year' element={< ValidatePath />}></Route>
        <Route path='/:start,:end' element={< ValidatePath />}></Route>
        <Route path='*' element={<NotFound />}></Route>
      </Routes>      
    </Suspense>
  );
}

function ValidatePath(props) {
  const params = useParams();
  const location = useLocation();

  // Validation Here
  let valid = true 
  if(params.year && !params.year.match(/^[0-9]{4}$/))
    valid = false
  if(params.month && !params.month.match(/^[0-9]{1,2}$/))
    valid = false
  if(params.day && !params.day.match(/^[0-9]{1,2}$/))
    valid = false
  if( (params.start && !params.end) || (!params.start && params.end) )
    valid = false
  if( (params.start && !params.start.match(/[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/) ) || (params.end && !params.end.match(/[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/) ) )
    valid = false
  if(valid)
    return <Past path={location.pathname} />
  return <NotFound />
}
