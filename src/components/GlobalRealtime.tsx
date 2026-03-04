import { useEffect } from 'react'
import { useAppDispatch } from '../store/hooks'
import echo from '../plugin/echo'

// CLUSTER
import {
  updateClusterRecord,
  deleteClusterRecord
} from '../store/slices/clusterSlice'

// BARANGAY
import {
  addBarangay,
  updateBarangayRecord,
  deleteBarangay
} from '../store/slices/barangaySlice'

const GlobalRealtime = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {

    // =========================
    // CLUSTERS CHANNEL
    // =========================
    const clusterChannel = echo.channel('clusters-channel')

    clusterChannel.listen('.ClusterUpdated', (e: any) => {

      const { cluster, type } = e

      if (type === 'created') {
        dispatch(updateClusterRecord({ data: cluster, mode: 'add' }))
      }

      if (type === 'updated') {
        dispatch(updateClusterRecord({ data: cluster, mode: 'edit' }))
      }

      if (type === 'deleted') {
        dispatch(deleteClusterRecord(cluster.id))
      }

    })

    // =========================
    // BARANGAYS CHANNEL
    // =========================
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

    // CLEANUP
    return () => {
      echo.leaveChannel('clusters-channel')
      echo.leaveChannel('barangays-channel')
    }

  }, [dispatch])

  return null
}

export default GlobalRealtime