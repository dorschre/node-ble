const { createBluetooth } = require('./src/index.js');

TEST_DEVICE = 'DB:86:CF:13:FC:2D'
async function main() {
    // Read the characterisitic of the given device

    const { bluetooth, destroy } = createBluetooth();

    // get bluetooth adapter
    const adapter = await bluetooth.defaultAdapter();
    await adapter.startDiscovery();

    // get device and connect
    const device = await adapter.waitDevice(TEST_DEVICE);
    setInterval(async () => {
        console.log('got device', await device.getAddress(), await device.getName(),await device.getManufacturingData());
    }, 2000);



}

main();