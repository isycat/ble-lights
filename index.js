const noble = require('noble');

console.log(":)");

noble.on('stateChange', (state) => {
    console.log("Noble state:   " + state);
    if (state == 'poweredOn') {
        const serviceUUIDs = []; // ["<service UUID 1>", ...]; // default: [] => all
        const allowDuplicates = false; // default: false
        noble.startScanning(serviceUUIDs, allowDuplicates, (error) => {
            console.log("error:")
            console.log(error);
            console.log(":--");
        });
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', (peripheral) => {
    console.log();
    const localName = peripheral.advertisement.localName;
    const serviceUuids = peripheral.advertisement.serviceUuids;
    const uuid = peripheral.uuid;
    if (!localName || !localName.startsWith("LED-")) {
        return;
    }
    console.log('Found device with local name: ' + localName + "  :  " + uuid);
    peripheral.connect((error) => {
        console.log('connected to peripheral: ' + peripheral.uuid);
        peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
            console.log("services loaded... " + services.map(s => s.uuid));
            const service = services.find(service => service.uuid == 'ffe0');
            if (!service || !service.characteristics
                    .find(characteristic => characteristic.uuid == 'ffe1')) {
                return;
            }
            console.log("Found service ffe0 with ffe1 characteristic");
            service.discoverCharacteristics(['ffe1'], function(error, characteristics) {
                console.log('discovered characteristic');
                setInterval(() => {
                    var cv;
                    if (Math.random() < 0.5) {
                        cv = 'ff'
                    } else {
                        cv = '00';
                    }
                    characteristics[0].write(new Buffer('7e070503ff00' + cv + '00ef', 'hex'), true, function(error) {
                        console.log('setting color');
                    });
                }, 1000);
            });
        });
    });

});