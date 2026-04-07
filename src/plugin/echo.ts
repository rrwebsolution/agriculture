import Echo from "laravel-echo"
import Pusher from "pusher-js"

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: 443,
  wssPort: 443, // Idagdag ito
  forceTLS: true,
  enabledTransports: ["wss", "ws"],
})

export default echo
