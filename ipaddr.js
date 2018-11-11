'use strict'
var os = require('os');

function getIP4Addrs() {

    let ifaces = os.networkInterfaces();
    let addrs = []

    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                addrs.push({name:`${ifname}:${alias}`, addr:iface.address})
            } else {
                // this interface has only one ipv4 adress
                addrs.push({name: ifname, addr: iface.address})
            }
            ++alias
        })
    })

    return addrs
}

module.exports = {
    getIP4Addrs: getIP4Addrs,
}

