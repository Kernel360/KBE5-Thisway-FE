import { mergeConfig } from 'vite';
import base from './vite.config.js';
const target = process.env.THISWAY_DEMO_BACKEND_URL || 'http://127.0.0.1:8080';
const port = Number(process.env.THISWAY_DEMO_FRONTEND_PORT || 5173);
if (new URL(target).hostname !== '127.0.0.1') throw new Error('Demo backend must be loopback');
export default mergeConfig(base, {server:{open:false,host:'127.0.0.1',proxy:{'/api':{
  target,changeOrigin:true,
  configure(proxy) {
    proxy.on('proxyReq', (proxyReq, req) => {
      // Only the chosen loopback demo origin is translated to the backend's existing dev origin.
      // Production CORS policy is unchanged; unrelated browser origins remain rejected.
      if ([`http://localhost:${port}`,`http://127.0.0.1:${port}`].includes(req.headers.origin)) {
        proxyReq.setHeader('Origin','http://localhost:5173');
      }
    });
  },
}}}});
