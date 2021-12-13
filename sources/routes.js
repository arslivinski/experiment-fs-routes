import importAll from 'import-all.macro';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const PAGES = importAll.deferred('./pages/**/*.js');

const ROUTES = Object.entries(PAGES).map((entry) => {
  const [filepath, Component] = entry;

  const path = filepath
    .replace(/\.\/pages|index|\.js/g, '')
    .replace(/\$\$all/, '*')
    .replace(/\$/, ':');

  return {
    filepath,
    path,
    Component: lazy(Component),
  };
});

function Router() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <Routes>
          {ROUTES.map((route) => (
            <Route key={route.filepath} path={route.path} element={<route.Component />} />
          ))}
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export { ROUTES, Router };
