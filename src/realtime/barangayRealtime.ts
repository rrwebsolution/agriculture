import echo from '../plugin/echo'
import { store } from '../store/store'
import { 
  addBarangay,
  updateBarangayRecord,
  deleteBarangay 
} from '../store/slices/barangaySlice'

export const initBarangayRealtime = () => {

  echo.channel('barangays-channel')
    .listen('.BarangayUpdated', (e: any) => {

      const { barangay, type } = e

      if (type === 'created') {
        store.dispatch(addBarangay(barangay))
      }

      if (type === 'updated') {
        store.dispatch(updateBarangayRecord(barangay))
      }

      if (type === 'deleted') {
        store.dispatch(deleteBarangay(barangay.id))
      }

    })

}