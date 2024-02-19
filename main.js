/**
 * Instrumentation setup
 */

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();



/**
 * Express
 */

const express = require('express');
const cors = require('cors');

const port = 3000;
const app = express();

// Root span (and others): http.route == "/" with a realistic example (handles all OPTIONS requests). https://expressjs.com/en/resources/middleware/cors.html
app.use(cors());
// Also http.route == "/" (but "route" matches every path)
// app.use((req, res) => {
//   res.send('use without path');
// });
// Same match behavior as above. http.route == "*"
// app.get('*', (req, res) => res.send('get *'));
// app.use('*', (req, res) => res.send('use *'));
// Same match behavior as above. http.route == "/"
// app.get('/*', (req, res) => res.send('get /*'));
// app.use('/*', (req, res) => res.send('use /*'));


const router1 = express.Router();
router1.get('/hello2', (req, res) => res.send('router1 /hello2'));
// router span: http.route == "/abc", but matches "/abc" and "/abc/*".
app.use('/abc', router1);
// Using app.METHOD you get the same matching behavior as router1 like:
app.get('/abc(/*)?', (req, res) => res.send('get /abc(/*)?'))


// Leads to http.route == "/1*" (root span and ?), but matches only /1 and /1/*
const router2 = express.Router();
router2.get('*', (req, res) => res.send('router2 *'));
app.use('/1', router2);


app.listen(port, () => console.log(`Listening on port ${port}`));
