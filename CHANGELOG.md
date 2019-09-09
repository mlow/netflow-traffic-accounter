# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
