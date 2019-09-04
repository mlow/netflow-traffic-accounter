netflow-traffic-accounter
=========================

NetFlow IP Traffic Accounting

This package provides a single class which exports aggregate traffic data of
local networks at a regular interval (by default every 5 minutes).

This wouldn't be possible without the the still-under-development
[node-netflowv9](https://github.com/delian/node-netflowv9) package, whose
author deserves the most credit!

NetFlow version 1,5,7 and 9 are supported.

Support for IPv6 (requiring NetFlow version 9) is not yet supported.

This has been tested with the RouterOS 'Traffic Flow' feature, and at the time
of writing [node-netflowv9](https://github.com/delian/node-netflowv9) has been
tested with Cisco IOS XR.

## Installation
    npm install --save netflow-traffic-accounter

## Usage
    const NetflowTrafficAccounter = require('netflow-traffic-accounter');

    const accounter = new NetflowTrafficAccounter({
        listenPort: 3000,
        exportInterval: 300,
        localNets: [
            '10.10.10.0/24',
            '192.168.0.0/24',
        ],
    }, function(data, periodFrom, periodTo) {
        // called every exportInterval seconds with traffic data collected
        // since the last export.

        // periodFrom, periodTo contain Unix timestamps of the collection
        // period's start and end.
    });

Traffic data is presented in the following format:

    {
        "10.10.10.1": {
            "in_bytes": 123123,
            "out_bytes": 123123,
            "in_pkts": 1231,
            "out_pkts: 1231,
        },
        "10.10.10.2": {
            ....
        },
        ...
    }

## Options

The NetflowTrafficAccounter class is intialized with an options object as the
first parameter and the data export callback as the second parameter.

The following options are available in the options object:

**listenPort** - Default: 3000. The port to listen for NetFlow data on.

**exportInterval** - Default: 300. How often to export aggregated traffic data.
Data is is exported when the following condition is true:

    currentSystemTime % exportInterval  == 0

**localNets** - Default: null. An array of subnets considered local, which we
will account incoming and outgoing traffic for. Can be an array of strings or
of `Netmask` objects from the [Netmask](https://github.com/rs/node-netmask)
package.
