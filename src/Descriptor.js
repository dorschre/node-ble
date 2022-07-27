const EventEmitter = require('events')
const BusHelper = require('./BusHelper')
const buildTypedValue = require('./buildTypedValue')

class Descriptor extends EventEmitter {
    constructor(dbus, adapter, device, service, characteristic, descriptor) {
        super()
        this.dbus = dbus
        this.adapter = adapter
        this.device = device
        this.service = service
        this.characteristic = characteristic
        this.helper = new BusHelper(dbus, 'org.bluez', `/org/bluez/${adapter}/${device}/${service}/${characteristic}/${descriptor}`, 'org.bluez.GattDescriptor1', { usePropsEvents: true })
    }

    /**
     * 128-bit characteristic UUID.
     * @returns {string}
     */
    async getUUID() {
        return this.helper.prop('UUID')
    }

    /**
     * Defines how the characteristic value can be used.
     * @returns {string[]}
     */
    async getFlags() {
        return this.helper.prop('Flag')
    }

    /**
     * Defines how the characteristic value can be used.
     * @returns {string[]}
     */
    async getValue() {
        return this.helper.prop('Value')
    }

}

module.exports = Descriptor