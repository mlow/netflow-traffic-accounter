const Collector = require("node-netflowv9");
const Netmask = require("netmask").Netmask;
const EventEmitter = require("events");

module.exports = class extends (
  EventEmitter
) {
  constructor(options, callback) {
    super();
    this.listenPort = 3000;
    this.exportInterval = 300;
    this.localNets = null;
    this.ignoreNets = null;
    this.callback = callback;
    this.netflowOptions = {};

    this.records = {};
    this.periodFrom = Math.trunc(Date.now() / 1000);
    this.lastExport = 0;
    this.lastSeq = 0;
    this.lastCount = 0;

    if (typeof options === "object") {
      if (options.listenPort) this.listenPort = options.listenPort;
      if (options.exportInterval) this.exportInterval = options.exportInterval;
      if (options.localNets) {
        this.localNets = this.asNetmaskArray(options.localNets);
      }
      if (options.ignoreNets) {
        this.ignoreNets = this.asNetmaskArray(options.ignoreNets);
      }
      if (options.netflowOptions) this.netflowOptions = options.netflowOptions;
    }

    this.collector = Collector({
      port: this.listenPort,
      ...this.netflowOptions,
    });
    this.collector.on("template", (record) => {
      this._checkSequence(record);
    });
    this.collector.on("data", (record) => {
      if (!this._checkSequence(record)) {
        return;
      }

      for (const f of record.flows) {
        const v4src = f.ipv4_src_addr;
        const v4dst = f.ipv4_dst_addr;
        const bytes = f.in_bytes;
        const pkts = f.in_pkts;

        if (this.isLocal(v4dst) && !this.isIgnored(v4src)) {
          this.accountTraffic(v4dst, "in", bytes, pkts);
        } else if (this.isLocal(v4src) && !this.isIgnored(v4dst)) {
          this.accountTraffic(v4src, "out", bytes, pkts);
        }
      }
    });

    this.timer = setInterval(() => {
      const now = Math.trunc(Date.now() / 1000);
      if (now % this.exportInterval == 0 && now > this.lastExport) {
        this.lastExport = now;
        this._export();
      }
    }, 500);
  }

  asNetmaskArray(arr) {
    return arr.map((net) => {
      if (net instanceof Netmask) {
        return net;
      } else if (typeof net === "string" || net instanceof String) {
        return new Netmask(net);
      }
    });
  }

  accountTraffic(addr, direction, bytes, packets) {
    if (!(addr in this.records)) {
      this.records[addr] = {
        in_bytes: 0,
        out_bytes: 0,
        in_pkts: 0,
        out_pkts: 0,
      };
    }
    this.records[addr][direction + "_bytes"] += bytes;
    this.records[addr][direction + "_pkts"] += packets;
  }

  isLocal(addr) {
    return this.localNets.find((net) => net.contains(addr));
  }

  isIgnored(addr) {
    return this.ignoreNets && this.ignoreNets.find((net) => net.contains(addr));
  }

  async _export() {
    const toExport = this.records;
    this.records = {};
    if (this.callback instanceof Function) {
      await this.callback(toExport, this.periodFrom, this.lastExport);
    }
    this.emit("export", toExport, this.periodFrom, this.lastExport);
    this.periodFrom = this.lastExport;
  }

  _checkSequence(record) {
    const version = record.header.version;
    const seq = record.header.sequence;
    const count = record.header.count;

    if (this.lastCount == 0) {
      this.lastSeq = seq;
      this.lastCount = count;
      return true;
    }

    let expectedSeq = -1;
    switch (version) {
      case 5:
        expectedSeq = this.lastSeq + this.lastCount;
        break;
      case 9:
        expectedSeq = this.lastSeq + 1;
        break;
      default:
        return true;
    }

    if (seq == this.lastSeq) {
      console.warn(
        `WARNING: Duplicate flow sequence ${seq} received, discarding.`
      );
      return false;
    }

    if (seq != expectedSeq) {
      console.warn(
        `WARNING: Flow sequence ${seq} is not the expected ${expectedSeq}.`
      );
    }

    this.lastSeq = seq;
    this.lastCount = count;
    return true;
  }

  async stop() {
    clearInterval(this.timer);
    this.collector.server.close();
    this.lastExport = Math.trunc(Date.now() / 1000);
    await this._export();
  }
};
