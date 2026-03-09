import { useEffect } from 'react'
import { useAppDispatch } from '../store/hooks'
import echo from '../plugin/echo'

// --- SLICE IMPORTS ---
import { updateClusterRecord, deleteClusterRecord } from '../store/slices/clusterSlice'
import { addBarangay, updateBarangayRecord, deleteBarangay } from '../store/slices/barangaySlice'
import { updateFarmerRecord, deleteFarmerRecord, updateFarmerBarangayList, updateFarmerCoopList, updateFarmerCropList } from '../store/slices/farmerSlice'
import { addFisherfolk, updateFisherfolkRecord, deleteFisherfolk, updateFisherfolkBarangayList } from '../store/slices/fisherfolkSlice'
import { addCooperative, updateCooperativeRecord, deleteCooperative, updateCoopBarangayList } from '../store/slices/cooperativeSlice'
import { addCrop, updateCropRecord, deleteCropRecord } from '../store/slices/cropSlice'

const RealtimeListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {

    /* ================= CLUSTER CHANNEL ================= */
    const clusterChannel = echo.channel('clusters-channel')
    clusterChannel.listen('.ClusterUpdated', (e: any) => {
      const { cluster, type } = e
      if (type === 'created') dispatch(updateClusterRecord({ data: cluster, mode: 'add' }))
      if (type === 'updated') dispatch(updateClusterRecord({ data: cluster, mode: 'edit' }))
      if (type === 'deleted') dispatch(deleteClusterRecord(cluster.id))
    })

    /* ================= BARANGAY CHANNEL ================= */
    const barangayChannel = echo.channel('barangays-channel')
    barangayChannel.listen('.BarangayUpdated', (e: any) => {
      const { barangay, type } = e
      if (type === 'created') dispatch(addBarangay(barangay))
      if (type === 'updated') dispatch(updateBarangayRecord(barangay))
      if (type === 'deleted') dispatch(deleteBarangay(barangay.id))
      
      // 🌟 SYNC TANANG DROPDOWNS
      dispatch(updateFarmerBarangayList({ barangay, type }))
      dispatch(updateCoopBarangayList({ barangay, type }))
      dispatch(updateFisherfolkBarangayList({ barangay, type })) // Added Fisherfolk Sync
    })

    /* ================= FARMER CHANNEL ================= */
    const farmerChannel = echo.channel('farmers-channel')
    farmerChannel.listen('.FarmerUpdated', (e: any) => {
      const { farmer, type } = e
      if (type === 'created') dispatch(updateFarmerRecord({ data: farmer, mode: 'add' }))
      if (type === 'updated') dispatch(updateFarmerRecord({ data: farmer, mode: 'edit' }))
      if (type === 'deleted') dispatch(deleteFarmerRecord(farmer.id))
    })

    /* ================= FISHERFOLK CHANNEL ================= */
    const fisherChannel = echo.channel('fisherfolks-channel')
    fisherChannel.listen('.FisherfolkUpdated', (e: any) => {
      const { fisherfolk, type } = e
      if (type === 'created') dispatch(addFisherfolk(fisherfolk))
      if (type === 'updated') dispatch(updateFisherfolkRecord({ data: fisherfolk, mode: 'edit' }))
      if (type === 'deleted') dispatch(deleteFisherfolk(fisherfolk.id))
    })

    /* ================= COOPERATIVE CHANNEL ================= */
    const coopChannel = echo.channel('cooperatives-channel')
    coopChannel.listen('.CooperativeUpdated', (e: any) => {
      const { cooperative, type } = e
      if (type === 'created') dispatch(addCooperative(cooperative))
      if (type === 'updated') dispatch(updateCooperativeRecord(cooperative))
      if (type === 'deleted') dispatch(deleteCooperative(cooperative.id))
      
      // Sync Dropdown in Farmer
      dispatch(updateFarmerCoopList({ cooperative, type }))
    })

    /* ================= CROP CHANNEL ================= */
    const cropChannel = echo.channel('crops-channel')
    cropChannel.listen('.CropUpdated', (e: any) => {
      const { crop, type } = e
      if (type === 'created') dispatch(addCrop(crop))
      if (type === 'updated') dispatch(updateCropRecord(crop))
      if (type === 'deleted') dispatch(deleteCropRecord(crop.id))
      
      // Sync Dropdown in Farmer
      dispatch(updateFarmerCropList({ crop, type }))
    })

    return () => {
      echo.leaveChannel('clusters-channel')
      echo.leaveChannel('barangays-channel')
      echo.leaveChannel('farmers-channel')
      echo.leaveChannel('fisherfolks-channel')
      echo.leaveChannel('cooperatives-channel')
      echo.leaveChannel('crops-channel') 
    }

  }, [dispatch])

  return null
}

export default RealtimeListener