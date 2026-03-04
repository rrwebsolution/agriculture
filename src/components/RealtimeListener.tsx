import { useEffect } from 'react'
import { useAppDispatch } from '../store/hooks'
import echo from '../plugin/echo'

// 🌟 CLUSTER
import {
  updateClusterRecord,
  deleteClusterRecord
} from '../store/slices/clusterSlice'

// 🌟 BARANGAY
import {
  updateBarangayRecord,
  addBarangay,
  deleteBarangay
} from '../store/slices/barangaySlice'

const RealtimeListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {

    /* =========================
       🌟 CLUSTER CHANNEL
    ========================== */
    const clusterChannel = echo.channel('clusters-channel')

    clusterChannel.listen('.ClusterUpdated', (e: any) => {

      const { cluster, type } = e

      if (type === 'created') {
        dispatch(updateClusterRecord({
          data: cluster,
          mode: 'add'
        }))
      }

      if (type === 'updated') {
        dispatch(updateClusterRecord({
          data: cluster,
          mode: 'edit'
        }))
      }

      if (type === 'deleted') {
        dispatch(deleteClusterRecord(cluster.id))
      }

    })


    /* =========================
       🌟 BARANGAY CHANNEL
    ========================== */
    const barangayChannel = echo.channel('barangays-channel')

    barangayChannel.listen('.BarangayUpdated', (e: any) => {

      const { barangay, type } = e

      if (type === 'created') {
        dispatch(addBarangay(barangay))
      }

      if (type === 'updated') {
        dispatch(updateBarangayRecord(barangay))
      }

      if (type === 'deleted') {
        dispatch(deleteBarangay(barangay.id))
      }

    })


    /* =========================
       🧹 CLEANUP
    ========================== */
    return () => {
      echo.leave('clusters-channel')
      echo.leave('barangays-channel')
    }

  }, [dispatch])

  return null
}

export default RealtimeListener