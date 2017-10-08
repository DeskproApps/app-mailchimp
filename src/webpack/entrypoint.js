import { createApp } from '@deskproapps/deskproapps-sdk-core';
import { runApp } from '../main/javascript';
import '../main/sass/index.scss';

createApp((dpapp) => {
  dpapp.manifest = DPAPP_MANIFEST;
  runApp(dpapp);
});