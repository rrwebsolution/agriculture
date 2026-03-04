import echo from '../plugin/echo'
import { store } from '../store/store'
import { updateClusterRecord, deleteClusterRecord } from '../store/slices/clusterSlice'

export const initClusterRealtime = () => {
  echo.channel('clusters-channel')
    .listen('.ClusterUpdated', (e: any) => {

      const { cluster, type } = e

      if (type === 'created') {
        store.dispatch(updateClusterRecord({
          data: cluster,
          mode: 'add'
        }))
      }

      if (type === 'updated') {
        store.dispatch(updateClusterRecord({
          data: cluster,
          mode: 'edit'
        }))
      }

      if (type === 'deleted') {
        store.dispatch(deleteClusterRecord(cluster.id))
      }

    })
}