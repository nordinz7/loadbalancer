import { startServer } from "./util.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { getServerPorts } from "./util.js";

const argv = yargs(hideBin(process.argv)).argv;

const args = {
  ...argv,
  p: argv.p || 8080,
  n: argv.n || 1,
  v: argv.v || false,
};

// Port
// Number of servers
getServerPorts(args.p, args.n).forEach((port) => {
  startServer(port, args.v);
});
