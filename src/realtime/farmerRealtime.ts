import echo from '../plugin/echo'
import { store } from '../store/store'

import {
  updateFarmerRecord,
  deleteFarmerRecord
} from '../store/slices/farmerSlice'

export const initFarmerRealtime = () => {

  echo.channel('farmers-channel')
    .listen('.FarmerUpdated', (e: any) => {

      const { farmer, type } = e

      if (type === 'created') {
        store.dispatch(updateFarmerRecord({
          data: farmer,
          mode: 'add'
        }))
      }

      if (type === 'updated') {
        store.dispatch(updateFarmerRecord({
          data: farmer,
          mode: 'edit'
        }))
      }

      if (type === 'deleted') {
        store.dispatch(deleteFarmerRecord(farmer.id))
      }

    })

}