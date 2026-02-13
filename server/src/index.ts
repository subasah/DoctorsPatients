import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerTranscribeRoutes } from './routes/transcribe.js';
import { registerSoapRoutes } from './routes/soap.js';
import { registerFhirRoutes } from './routes/fhir.js';

const app = express();

app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
    credentials: false
  })
);
app.use(express.json({ limit: '2mb' }));

registerHealthRoutes(app);
registerTranscribeRoutes(app);
registerSoapRoutes(app);
registerFhirRoutes(app);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${config.port}`);
});

