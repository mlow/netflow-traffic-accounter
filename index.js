const Collector = require("node-netflowv9");
const Netmask = require("netmask").Netmask;
const EventEmitter = require("events");

module.exports = class extends EventEmitter {
  constructor(options, callback) {
    super();
    this.listenPort = 3000;
    this.exportInterval = 300;
    this.localNets = null;
    this.callback = callback;

    this.records = {};
    this.periodFrom = Math.trunc(Date.now() / 1000);
    this.lastExport = 0;

    if (typeof options == "object") {
      if (options.listenPort) this.listenPort = options.listenPort;
      if (options.exportInterval) this.exportInterval = options.exportInterval;
      if (options.localNets) {
        this.localNets = options.localNets.map(net => {
          if (net instanceof Netmask) {
            return net;
          } else if (typeof net === "string" || net instanceof String) {
            return new Netmask(net);
          }
        });
      }
    }

    this.collector = Collector({ port: this.listenPort });
    this.collector.on("data", record => {
      for (let f of record["flows"]) {
        let v4src = f["ipv4_src_addr"];
        let v4dst = f["ipv4_dst_addr"];
        let v4nextHop = f["ipv4_next_hop"];
        let bytes = f["in_bytes"];
        let pkts = f["in_pkts"];

        if (this.isLocal(v4dst)) {
          this.accountTraffic(v4dst, "in", bytes, pkts);
        } else if (this.isLocal(v4nextHop)) {
          this.accountTraffic(v4nextHop, "in", bytes, pkts);
        } else if (this.isLocal(v4src)) {
          this.accountTraffic(v4src, "out", bytes, pkts);
        }
      }
    });

    this.timer = setInterval(() => {
      let now = Math.trunc(Date.now() / 1000);
      if (now % this.exportInterval == 0 && now > this.lastExport) {
        this.lastExport = now;
        this._export();
      }
    }, 500);
  }

  accountTraffic(addr, direction, bytes, packets) {
    if (!(addr in this.records)) {
      this.records[addr] = {
        in_bytes: 0,
        out_bytes: 0,
        in_pkts: 0,
        out_pkts: 0
      };
    }
    this.records[addr][direction + "_bytes"] += bytes;
    this.records[addr][direction + "_pkts"] += packets;
  }

  isLocal(addr) {
    return this.localNets.find(net => net.contains(addr));
  }

  _export() {
    let toExport = this.records;
    this.records = {};
    if (this.callback instanceof Function) {
      this.callback(toExport, this.periodFrom, this.lastExport);
    }
    this.emit("export", toExport, this.periodFrom, this.lastExport);
    this.periodFrom = this.lastExport;
  }

  async stop() {
    clearInterval(this.timer);
    this.collector.server.close();
    this.lastExport = Math.trunc(Date.now() / 1000);
    this._export();
  }
};
