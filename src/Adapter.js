const Device = require('./Device')
const BusHelper = require('./BusHelper')

class Adapter {
  constructor(dbus, adapter) {
    this.dbus = dbus
    this.adapter = adapter
    this.helper = new BusHelper(dbus, 'org.bluez', `/org/bluez/${adapter}`, 'org.bluez.Adapter1')
  }

  async getAddress() {
    return await this.helper.prop('Address')
  }

  async getAddressType() {
    return await this.helper.prop('AddressType')
  }

  async getName() {
    return await this.helper.prop('Name')
  }

  async getAlias() {
    return await this.helper.prop('Alias')
  }

  async isPowered() {
    return await this.helper.prop('Powered')
  }

  async isDiscovering() {
    return await this.helper.prop('Discovering')
  }

  async startDiscovery() {
    if (await this.isDiscovering()) {
      throw new Error('Discovery already in progress')
    }
    await this.helper.callMethod('StartDiscovery')
  }

  async stopDiscovery() {
    if (!await this.isDiscovering()) {
      throw new Error('No discovery started')
    }
    await this.helper.callMethod('StopDiscovery')
  }

  async devices() {
    const devices = await this.helper.children()
    return devices.map(Adapter.deserializeUUID)
  }

  async getDevice(uuid) {
    const serializedUUID = Adapter.serializeUUID(uuid)

    const devices = await this.helper.children()
    if (!devices.includes(serializedUUID)) {
      throw new Error('Device not found')
    }

    return new Device(this.dbus, this.adapter, serializedUUID)
  }

  async toString() {
    const name = await this.getName()
    const address = await this.getAddress()

    return `${name} [${address}]`
  }

  static serializeUUID(uuid) {
    return `dev_${uuid.replace(/:/g, '_')}`
  }

  static deserializeUUID(uuid) {
    return uuid.substring(4).replace(/_/g, ':')
  }
}

module.exports = Adapter