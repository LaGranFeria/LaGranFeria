import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "./common/Context";

import Loader from "./components/Loaders/Loader";

const LoaderContent = lazy(() => import("./App"));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <AppProvider>
    <Suspense fallback={<Loader />}>
      <LoaderContent />
    </Suspense>
  </AppProvider>
  // </React.StrictMode>
);
