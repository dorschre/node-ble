const EventEmitter = require('events')
const BusHelper = require('./BusHelper')
const buildTypedValue = require('./buildTypedValue')
const Descriptor = require('./Descriptor')
/**
 * @classdesc GattCharacteristic class interacts with a GATT characteristic.
 * @class GattCharacteristic
 * @extends EventEmitter
 * @see You can construct a GattCharacteristic object via {@link GattService#getCharacteristic} method.
 */
class GattCharacteristic extends EventEmitter {
  constructor(dbus, adapter, device, service, characteristic) {
    super()
    this.dbus = dbus
    this.adapter = adapter
    this.device = device
    this.service = service
    this.characteristic = characteristic
    this.helper = new BusHelper(dbus, 'org.bluez', `/org/bluez/${adapter}/${device}/${service}/${characteristic}`, 'org.bluez.GattCharacteristic1', { usePropsEvents: true })
    this._descriptor = {}
    this._last_subscribed_value = undefined
  }

  async init() {
    this._descriptor = {}
    /*
    
    */

    const children = await this.helper.children()
    for (const c of children) {
      const descriptor = new Descriptor(this.dbus, this.adapter, this.device, this.service, this.characteristic, c)
      const uuid = await descriptor.getUUID()
      this._descriptor[uuid] = descriptor
    }
  }

  /**
 * List of available characteristic names.
 * @returns {string[]}
 */
  async descriptors() {
    return Object.keys(this._descriptor)
  }

  /**
   * 
   * Returns the Descriptor.
  */
  async getDescriptor (uuid) {
    if (uuid in this._descriptor) {
      return this._descriptor[uuid]
    }

    throw new Error('Descriptor not available')
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
    return this.helper.prop('Flags')
  }

  /**
   * True, if notifications or indications on this characteristic are currently enabled.
   * @returns {boolean}
   */
  async isNotifying() {
    return this.helper.prop('Notifying')
  }

  /**
   * Read the value of the characteristic
   * @param {number} [offset = 0]
   * @returns {Buffer}
   */
  async readValue(offset = 0) {
    const options = {
      offset: buildTypedValue('uint16', offset)
    }
    const payload = await this.helper.callMethod('ReadValue', options)
    return Buffer.from(payload)
  }

  /**
   * Write the value of the characteristic.
   * @param {Buffer} value - Buffer containing the characteristic value.
   * @param {number|Object} [optionsOrOffset = 0] - Starting offset or writing options.
   * @param {number} [optionsOrOffset.offset = 0] - Starting offset.
   * @param {WritingMode} [optionsOrOffset.type = reliable] - Writing mode
   */
  async writeValue(value, optionsOrOffset = {}) {
    if (!Buffer.isBuffer(value)) {
      throw new Error('Only buffers can be wrote')
    }

    const options = typeof optionsOrOffset === 'number' ? { offset: optionsOrOffset } : optionsOrOffset
    const mergedOptions = Object.assign({ offset: 0, type: 'reliable' }, options)

    const callOptions = {
      offset: buildTypedValue('uint16', mergedOptions.offset),
      type: buildTypedValue('string', mergedOptions.type)
    }

    const { data } = value.toJSON()
    await this.helper.callMethod('WriteValue', data, callOptions)
  }

  /**
   * Starts a notification session from this characteristic.
   * It emits valuechanged event when receives a notification.
   */
  async startNotifications() {
    await this.helper.callMethod('StartNotify')

    const cb = (propertiesChanged) => {
      if ('Value' in propertiesChanged) {
        const { value } = propertiesChanged.Value
        
        if (this._last_subscribed_value != value.toString()){
          this.emit('valuechanged', Buffer.from(value))
          this._last_subscribed_value = value.toString();
        }

      }
    }

    this.helper.on('PropertiesChanged', cb)
  }

  async stopNotifications() {
    await this.helper.callMethod('StopNotify')
    this.helper.removeAllListeners('PropertiesChanged') // might be improved
  }

  async toString() {
    return this.getUUID()
  }
}

module.exports = GattCharacteristic

/**
* @typedef WritingMode
* @property {string} command Write without response
* @property {string} request Write with response
* @property {string} reliable Reliable Write
*/

/**
 * Notification event
 *
 * @event GattCharacteristic#valuechanged
 * @type {Buffer}
*/
