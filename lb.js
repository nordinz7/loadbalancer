import { createServer, get } from "node:http";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getServerPorts } from "./util.js";

const argv = yargs(hideBin(process.argv)).argv;

const args = {
  ...argv,
  p: argv.p || 3000,
  s: argv.s || 8080,
  n: argv.n || 2,
  h: argv.h || 10,
};

// Port
// Server Port
// Number of servers
// Healthcheck interval seconds

const pp = getServerPorts(args.s, args.n);

const serverTables = Object.fromEntries(pp.map((p) => [p, null]));

const runHealthCheck = (port) => {
  let previousStatus = serverTables[port];

  setInterval(() => {
    get(`http://localhost:${port}/health`, (res) => {
      const currentStatus = res.statusCode === 200 ? "Ok" : "Fail";
      if (currentStatus !== previousStatus) {
        serverTables[port] = currentStatus;
        console.table(serverTables);
        previousStatus = currentStatus;
      }
    }).on("error", (err) => {
      if (err.code === "ECONNREFUSED") {
        const currentStatus = "Fail";
        if (currentStatus !== previousStatus) {
          serverTables[port] = currentStatus;
          console.table(serverTables);
          previousStatus = currentStatus;
        }
      } else {
        console.error("Health check error:", err);
      }
    });
  }, args.h * 1000);
};

function* getPort() {
  for (let i = 0; i < pp.length; i++) {
    const p = pp[i];

    if (serverTables[p] !== "Ok") {
      continue;
    }

    yield p;
  }
}

let p = getPort();
const getPortRoute = () => {
  const route = p.next();
  const isEndCycle = route.done;

  if (isEndCycle) {
    p = getPort();
    return p.next().value;
  }

  return route.value;
};

const server = createServer((req, resS) => {
  console.log("Received request from:", req.connection.remoteAddress);
  console.log("Method:", `${req.method} ${req.url} HTTP/${req.httpVersion}`);
  console.log("Host:", req.headers.host);
  console.log("User-Agent:", req.headers["user-agent"]);
  console.log("Accept:", req.headers["accept"]);
  const port = getPortRoute();

  get(`http://localhost:${port}`, (res) => {
    console.log(
      `Response from server: HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}`
    );
    res.on("data", (d) => {
      console.log(d.toString());
      resS.end(d);
    });
  });
});

server.listen(args.p, "127.0.0.1", () => {
  pp.forEach(runHealthCheck);
  console.log(`Listening on 127.0.0.1:${args.p}`);
});
