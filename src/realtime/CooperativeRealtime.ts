import echo from '../plugin/echo'
import { store } from '../store/store'

import {
  addCooperative,
  updateCooperativeRecord,
} from '../store/slices/cooperativeSlice'

export const initCooperativeRealtime = () => {

  const channel = echo.channel('cooperatives-channel')

  channel.listen('.CooperativeUpdated', (e: any) => {

    const { cooperative, type } = e

    if (type === 'created') {
      store.dispatch(addCooperative(cooperative))
    }

    if (type === 'updated') {
      store.dispatch(updateCooperativeRecord({
        data: cooperative,
        mode: 'edit'
      }))
    }

    if (type === 'deleted') {
      store.dispatch(updateCooperativeRecord({
        data: cooperative.id,
        mode: 'delete'
      }))
    }

  })

  // Optional: return cleanup function (BEST PRACTICE)
  return () => {
    echo.leaveChannel('cooperatives-channel')
  }
}