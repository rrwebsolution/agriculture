import echo from '../plugin/echo'
import { store } from '../store/store'

import {
  addFisherfolk,
  updateFisherfolkRecord,
  deleteFisherfolk
} from '../store/slices/fisherfolkSlice'

export const initFisherfolkRealtime = () => {

  echo.channel('fisherfolks-channel')
    .listen('.FisherfolkUpdated', (e: any) => {

      const { fisherfolk, type } = e

      if (type === 'created') {
        store.dispatch(addFisherfolk(fisherfolk))
      }

      if (type === 'updated') {
        store.dispatch(updateFisherfolkRecord({
          data: fisherfolk,
          mode: 'edit'
        }))
      }

      if (type === 'deleted') {
        store.dispatch(deleteFisherfolk(fisherfolk.id))
      }

    })

}