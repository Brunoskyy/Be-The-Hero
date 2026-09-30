import { io } from 'socket.io-client'

import { API_URL } from './api.js'

let socket = null

/** One connection per tab, opened on first use. */
export function getSocket() {
  if (!socket) socket = io(API_URL, { autoConnect: true })
  return socket
}
