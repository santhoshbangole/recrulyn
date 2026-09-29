import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "react-router-dom";

import "./assets/styles/theme.css";
import { router } from "./app/router";
import { AuthProvider } from "./app/providers/AuthProvider";
import {
  NotificationProvider,
  Notification,
} from "./components/notification";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;

  return Boolean(target.closest("[contenteditable='true']"));
}

// Prevent Backspace from acting as browser "Back" when not typing in a field.
// That history jump was landing on missing/protected routes and showing a 404.
window.addEventListener("keydown", (event) => {
  if (event.key !== "Backspace") return;
  if (isEditableTarget(event.target)) return;
  event.preventDefault();
});

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
  <AuthProvider>
  <NotificationProvider>

    <RouterProvider router={router} />

    <Notification />

  </NotificationProvider>
</AuthProvider>
  </React.StrictMode>
);