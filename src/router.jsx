import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Map from "./Map";
import CountryMap from "./CountryMask";
import ReactLeafletPopup from "./ReactLeafletPopup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
  {
    path: "/map",
    element: <Map />,
  },
  {
    path: "/mask",
    element: <ReactLeafletPopup />,
  },
]);

export default router;

