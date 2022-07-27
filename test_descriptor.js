const { createBluetooth } = require('./src/index.js');

var TEST_DEVICE = 'A4:DD:70:90:3F:AE';
var TEST_SERVICE = 'D65D0396-0000-4381-9985-653653CE831F';
var TEST_CHARACTERISTIC = 'D65D0396-0001-4381-9985-653653CE831F';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function main() {
    // Read the characterisitic of the given device

    const { bluetooth, destroy } = createBluetooth();

    // get bluetooth adapter
    const adapter = await bluetooth.defaultAdapter();
    await adapter.startDiscovery();

    // get device and connect
    const device = await adapter.waitDevice(TEST_DEVICE);
    console.log('got device', await device.getAddress(), await device.getName());
    await device.connect();
    console.log('connected');
    const gattServer = await device.gatt()
    console.log(gattServer.services());

    // read value
    const services = await gattServer.services();
    services.forEach(async (serviceID) => {
        const service = await gattServer.getPrimaryService(serviceID);
        const characteristics = await service.characteristics();
        characteristics.forEach(async (characteristicID) => {
            const characteristic = await service.getCharacteristic(characteristicID);
            const descriptors = await characteristic.descriptors();
            descriptors.forEach(async (descriptorID) => {
                const descriptor = await characteristic.getDescriptor(descriptorID);
                console.log(await descriptor.getUUID()) //, await descriptor.getFlags(), await descriptor.getValue());
                console.log(await descriptor.getValue())
            })
        })
    });

}







sleep(5000).then(() => main());