# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1](https://github.com/mlow/netflow-traffic-accounter/compare/v0.4.0...v0.4.1) (2021-02-12)

### Fixed

- Fix: make \_export() async and await the callback (9d2cc2c5afef15ce4ce9a3d60b77667d5a23866e)
- Ensure an in-progress export is awaited in stop (31774fa52aef4f5349a7c850634d05b1aea3d7ce)

## [0.4.0](https://github.com/mlow/netflow-traffic-accounter/compare/v0.3.1...v0.4.0) (2020-03-31)

### Added

- Add ignoreNets option which allows for not counting traffic between localNets
  hosts and ignoreNets hosts.

### Changed

- No longer account packets where ipv4_next_hop is in local_nets

## [0.3.1](https://github.com/mlow/netflow-traffic-accounter/compare/v0.3.0...v0.3.1) (2019-09-10)

- Fixed erroneous incorrect flow sequence warnings.

## [0.3.0](https://github.com/mlow/netflow-traffic-accounter/compare/v0.2.0...v0.3.0) (2019-09-09)

### Added

- Add checking for duplicate/out-of-sequence Netflow packets. Warning messages
  are emitted for either, duplicate packets are discarded.

## [0.2.0](https://github.com/mlow/netflow-traffic-accounter/compare/v0.1.0...v0.2.0) (2019-09-05)

### Added

- Emit 'export' event as alternative to using a callback.
- Allow passing options directly to `node-netflowv9`'s `Collector`. See
  [here](https://github.com/delian/node-netflowv9#Options) for available options.

## [0.1.0](https://github.com/mlow/netflow-traffic-accounter/tree/v0.1.0) (2019-09-04)

### Added

- Basic support for IPv4 traffic accounting
