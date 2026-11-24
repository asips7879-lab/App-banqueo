// Servidor estático mínimo para desarrollo. No necesita dependencias.
//
//   npm run dev                       → http://localhost:8080
//   PORT=3000 npm run dev             → otro puerto (macOS / Linux)
//   $env:PORT=3000; npm run dev       → otro puerto (Windows PowerShell)
//
// La app también funciona abriendo index.html con doble clic (file://);
// el servidor sirve para probarla como se verá en línea.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function responder(req, res) {
  let ruta;
  try {
    ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Solicitud inválida');
    return;
  }
  if (ruta.endsWith('/')) ruta += 'index.html';

  // Impide salir de la carpeta del proyecto (../../etc).
  const archivo = path.join(RAIZ, ruta);
  if (!archivo.startsWith(RAIZ + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Prohibido');
    return;
  }

  fs.readFile(archivo, (err, datos) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado: ' + ruta);
      return;
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(datos);
  });
}

// Escucha solo en este equipo (127.0.0.1). Devuelve el servidor ya iniciado.
function iniciar(puerto = Number(process.env.PORT) || 8080) {
  return new Promise((resolve, reject) => {
    const servidor = http.createServer(responder);
    servidor.once('error', reject);
    servidor.listen(puerto, '127.0.0.1', () => resolve(servidor));
  });
}

if (require.main === module) {
  iniciar()
    .then((s) => console.log(`Banqueo JorG en http://localhost:${s.address().port}  (Ctrl+C para detener)`))
    .catch((e) => {
      console.error(e.code === 'EADDRINUSE' ? 'Ese puerto ya está en uso. Prueba con otro (ver arriba).' : e.message);
      process.exit(1);
    });
}

module.exports = { iniciar };
