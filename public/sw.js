self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW aktivní");
});

self.addEventListener("fetch", (event) => {});