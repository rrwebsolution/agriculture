import echo from '../plugin/echo'
import { store } from '../store/store'

// 🌟 I-IMPORT ANG SAKTONG ACTIONS GIKAN SA CROPSLICE
import {
  addCrop,
  updateCropRecord,
  deleteCropRecord
} from '../store/slices/cropSlice'

export const initCropRealtime = () => {

  const channel = echo.channel('crops-channel')

  channel.listen('.CropUpdated', (e: any) => {

    const { crop, type } = e

    if (type === 'created') {
      // 🌟 ADD
      store.dispatch(addCrop(crop))
    }

    if (type === 'updated') {
      // 🌟 UPDATE (Walay { data, mode } wrapper kay raw object atong gi-setup)
      store.dispatch(updateCropRecord(crop))
    }

    if (type === 'deleted') {
      // 🌟 DELETE (ID ra ang ipadala kay mao may gipangita sa deleteCropRecord)
      store.dispatch(deleteCropRecord(crop.id))
    }

  })

  // Optional: return cleanup function (BEST PRACTICE)
  return () => {
    echo.leaveChannel('crops-channel')
  }
}