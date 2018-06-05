import EventEmitter from 'events'

export default class RWS extends EventEmitter {
  url: string
  options: object
  protocols: Array<any>
  ws: WebSocket
  forcedClose: boolean
  timedOut: boolean
  reconnectAttempts: number
  readyState: number
  protocol: string

  // setting
  debug: boolean
  automaticOpen: boolean
  reconnectInterval: number
  maxReconnectInterval: number
  reconnectDecay: number
  timeoutInterval: number
  maxReconnectAttempts: any
  binaryType: string

  // 事件函数
  onconnectiong: Function
  onopen: Function
  onclose: Function
  onmessage: Function
  onerror: Function

  timeout: any

  // webSocket
  CONNECTING: any
  OPEN: any
  CLOSING: any
  CLOSED: any
  DEFAULT_CODE: number

  // tslint:disable-next-line:space-before-function-paren
  constructor(url: string, options: object = {}, protocols: Array<any> = []) {
    super()
    const settings = {
      debug: false,
      automaticOpen: true,
      reconnectInterval: 1000,
      maxReconnectInterval: 60000,
      reconnectDecay: 1.5,
      timeoutInterval: 2000,
      maxReconnectAttempts: null,
      binaryType: 'blob'
    }

    this.url = url
    this.protocols = protocols
    const settingsKeys = Object.keys(settings)
    for (const setting of settingsKeys) {
      this[setting] = setting in options ? options[setting] : settings[setting]
    }

    this.ws = null
    this.forcedClose = false
    this.timedOut = false
    this.reconnectAttempts = 0
    this.readyState = WebSocket.CONNECTING
    this.protocol = null

    // Initialize callbacks
    const handlers = ['onconnecting', 'onopen', 'onclose', 'onmessage', 'onerror']
    for (const handler of handlers) {
      this[handler] = (event) => event
    }

    this.on('connection', (event) => {
      this.onconnectiong(event)
    })

    this.on('open', (event) => {
      this.onopen(event)
    })

    this.on('message', (event) => {
      this.onmessage(event)
    })

    this.on('error', (event) => {
      this.onerror(event)
    })

    if (this.automaticOpen === true) {
      this.open(false)
    }

    this.CONNECTING = WebSocket.CONNECTING
    this.OPEN = WebSocket.OPEN
    this.CLOSING = WebSocket.CLOSING
    this.CLOSED = WebSocket.CLOSED

    this.DEFAULT_CODE = 1000
  }

  dbg (...args) {
    if (this.debug) {
      console.debug(...args)
    }
  }

  open (reconnectAttempt = false) {
    let self = this
    let isReconnectAttempt = reconnectAttempt
    this.ws = new WebSocket(this.url, this.protocols);
    (this.ws.binaryType as any) = this.binaryType

    // check for max reconnect attempts
    if (reconnectAttempt) {
      if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
        return
      }
    } else {
      this.emit('connecting', { isReconnect: isReconnectAttempt })
      this.reconnectAttempts = 0
    }

    this.dbg('RWS', 'attempt-connect', this.url)

    this.timeout = setTimeout(() => {
      this.dbg('RWS', 'connection-timeout', this.url)
      this.timedOut = true
      this.ws.close()
      this.timedOut = false
    }, this.timeoutInterval)

    this.ws.onopen = (event) => {
      clearTimeout(this.timeout)
      this.dbg('RWS', 'onopen', this.url)
      this.protocol = this.ws.protocol
      this.readyState = WebSocket.OPEN
      this.reconnectAttempts = 0;
      (event as any).isReconnect = isReconnectAttempt
      this.emit('open', event)
      isReconnectAttempt = false
    }

    this.ws.onclose = (event) => {
      clearTimeout(this.timeout)
      this.ws = null
      if (this.forcedClose) {
        this.readyState = WebSocket.CLOSED
        this.emit('close')
      } else {
        if (!this.reconnectAttempts && !this.timeout) {
          this.dbg('RWS', 'onclose', this.url)
          this.emit('close')
        }
        (event as any).isReconnect = true
        this.emit('connecting', event)
        const timeout = this.reconnectInterval * Math.pow(
          this.reconnectDecay, this.reconnectAttempts)
        setTimeout(() => {
          this.reconnectAttempts++
          this.open(true)
        }, timeout > this.maxReconnectInterval ? this.maxReconnectInterval : timeout)
      }
    }

    this.ws.onmessage = (event) => {
      this.dbg('RWS', 'onmessage', this.url, event.data)
      this.emit('message', event)
    }

    this.ws.onerror = (event) => {
      this.dbg('RWS', 'onerror', this.url, event)
      this.emit('error', event)
    }
  }

  send (message) {
    if (this.ws) {
      this.dbg('RWS', 'send', this.url, message)
      return this.ws.send(message)
    }
    throw new Error('INVALID_STATE_ERR')
  }

  close () {
    this.forcedClose = true
    if (this.ws) {
      this.ws.close()
    }
  }

  refresh () {
    if (this.ws) {
      this.ws.close()
    }
  }
}
