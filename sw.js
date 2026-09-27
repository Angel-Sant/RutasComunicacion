/* Service worker de Transporte Bilbao.
   SUBE EL NÚMERO DE VERSION cada vez que cambies cualquier archivo:
   es lo que hace que los celulares se enteren de la versión nueva. */
var VERSION = "tb-v4";

/* archivos propios: se guardan al instalar */
var BASICOS = [
  "index.html",
  "papas.html",
  "admin.html",
  "manifest-aux.json",
  "manifest-papas.json",
  "manifest-admin.json",
  "iconos/icono-aux-192.png",
  "iconos/icono-aux-512.png",
  "iconos/icono-papas-192.png",
  "iconos/icono-papas-512.png",
  "iconos/icono-admin-192.png",
  "iconos/icono-admin-512.png"
];

function esSDK(url){
  return url.hostname.indexOf("gstatic.com") !== -1;
}
function esDatosVivos(url){
  return url.hostname.indexOf("googleapis.com") !== -1
      || url.hostname.indexOf("firebaseio.com") !== -1
      || url.hostname.indexOf("firebaseapp.com") !== -1
      || url.hostname.indexOf("firebaseinstallations") !== -1;
}

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(VERSION).then(function(c){
      /* uno por uno: si alguno falla, los demás sí quedan guardados */
      return Promise.all(BASICOS.map(function(u){
        return c.add(new Request(u, {cache:"reload"})).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){ if(k !== VERSION) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("message", function(e){
  if(e.data === "actualizar") self.skipWaiting();
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  var url = new URL(req.url);

  /* datos vivos de Firebase: nunca se guardan */
  if(esDatosVivos(url)) return;

  /* SDK de Firebase: primero lo guardado, para poder abrir sin señal.
     Se guarda conforme se usa, así que basta con haber abierto la app
     una vez con internet. */
  if(esSDK(url)){
    e.respondWith(
      caches.open(VERSION).then(function(c){
        return c.match(req.url, {ignoreVary:true, ignoreSearch:true}).then(function(guardado){
          if(guardado) return guardado;
          return fetch(req).then(function(resp){
            /* solo se guarda una respuesta buena: guardar un error
               dejaría la app rota hasta la siguiente versión */
            if(resp && resp.status === 200){
              c.put(req.url, resp.clone()).catch(function(){});
            }
            return resp;
          });
        });
      })
    );
    return;
  }

  /* archivos propios: primero la red, para traer siempre lo último;
     sin señal, la copia guardada */
  if(url.origin === location.origin){
    e.respondWith(
      fetch(req).then(function(resp){
        if(resp && resp.status === 200){
          var copia = resp.clone();
          caches.open(VERSION).then(function(c){ c.put(req.url, copia).catch(function(){}); });
        }
        return resp;
      }).catch(function(){
        return caches.open(VERSION).then(function(c){
          return c.match(req.url, {ignoreVary:true, ignoreSearch:true}).then(function(r){
            return r || c.match(req, {ignoreSearch:true}) || Response.error();
          });
        });
      })
    );
  }
});
