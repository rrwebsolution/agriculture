import { useEffect } from 'react'
import { useAppDispatch } from '../store/hooks'
import echo from '../plugin/echo'

// --- SLICE IMPORTS ---
import { updateClusterRecord, deleteClusterRecord } from '../store/slices/clusterSlice'
import { addBarangay, updateBarangayRecord, deleteBarangay } from '../store/slices/barangaySlice'
import { updateFarmerRecord, deleteFarmerRecord, updateFarmerBarangayList, updateFarmerCoopList, updateFarmerCropList } from '../store/slices/farmerSlice'
import { addFisherfolk, updateFisherfolkRecord, deleteFisherfolk, updateFisherfolkBarangayList, updateFisherfolkCoopList, updateFisherfolkCatchRecord } from '../store/slices/fisherfolkSlice'
import { addCooperative, updateCooperativeRecord, deleteCooperative, updateCoopBarangayList } from '../store/slices/cooperativeSlice'
import { addCrop, updateCropRecord, deleteCropRecord } from '../store/slices/cropSlice'
import { addPlantingRecord, updatePlantingRecord, deletePlantingRecord } from '../store/slices/plantingSlice'
import { addHarvestRecord, updateHarvestRecord, syncHarvestReference, deleteHarvestRecord } from '../store/slices/harvestSlice'
import { updateFisheryRecord, deleteFisheryRecord } from '../store/slices/fisherySlice'
import { addExpense, updateExpense, archiveExpense, restoreExpense, removeExpenseRecord } from '../store/slices/expenseSlice'

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
      dispatch(updateFisherfolkBarangayList({ barangay, type }))
      dispatch(updatePlantingRecord(
        type === 'deleted'
          ? { deleted_barangay_id: barangay.id }
          : { barangay }
      ))
      dispatch(
        syncHarvestReference(
          type === 'deleted'
            ? { deleted_barangay_id: barangay.id }
            : { barangay }
        )
      )
    })

    /* ================= FARMER CHANNEL ================= */
    const farmerChannel = echo.channel('farmers-channel')
    farmerChannel.listen('.FarmerUpdated', (e: any) => {
      const { farmer, type } = e
      if (type === 'created') dispatch(updateFarmerRecord({ data: farmer, mode: 'add' }))
      if (type === 'updated') dispatch(updateFarmerRecord({ data: farmer, mode: 'edit' }))
      if (type === 'deleted') dispatch(deleteFarmerRecord(farmer.id))
      if (type === 'created' || type === 'updated') {
        dispatch(updatePlantingRecord({ farmer }))
        dispatch(syncHarvestReference({ farmer }))
      }
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
      
      // Sync dropdowns in Farmer and Fisherfolk registries
      dispatch(updateFarmerCoopList({ cooperative, type }))
      dispatch(updateFisherfolkCoopList({ cooperative, type }))
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
      dispatch(
        updatePlantingRecord(
          type === 'deleted'
            ? { deleted_crop_id: crop.id }
            : { crop }
        )
      )
      dispatch(
        syncHarvestReference(
          type === 'deleted'
            ? { deleted_crop_id: crop.id }
            : { crop }
        )
      )
    })

    /* ================= PLANTING CHANNEL ================= */
    const plantingChannel = echo.channel('plantings-channel')
    plantingChannel.listen('.PlantingUpdated', (e: any) => {
      const { planting, action } = e
      if (action === 'created') dispatch(addPlantingRecord(planting))
      if (action === 'updated') dispatch(updatePlantingRecord(planting))
      if (action === 'deleted') dispatch(deletePlantingRecord(planting?.id || planting))
    })

    /* ================= HARVEST CHANNEL ================= */
    const harvestChannel = echo.channel('harvests-channel')
    harvestChannel.listen('.HarvestUpdated', (e: any) => {
      const { harvest, type } = e
      if (type === 'created') dispatch(addHarvestRecord(harvest))
      if (type === 'updated') dispatch(updateHarvestRecord(harvest))
      if (type === 'deleted') dispatch(deleteHarvestRecord(harvest.id))
    })

    /* ================= FISHERY CHANNEL ================= */
    const fisheryChannel = echo.channel('fisheries-channel')
    fisheryChannel.listen('.FisheryUpdated', (e: any) => {
      const { fishery, type } = e
      if (type === 'created') dispatch(updateFisheryRecord({ data: fishery, mode: 'add' }))
      if (type === 'updated') dispatch(updateFisheryRecord({ data: fishery, mode: 'edit' }))
      if (type === 'deleted') dispatch(deleteFisheryRecord(fishery.id))
      if (type === 'created' || type === 'updated' || type === 'deleted') {
        dispatch(updateFisherfolkCatchRecord({ fishery, type }))
      }
    })

    /* ================= EXPENSE CHANNEL ================= */
    const expenseChannel = echo.channel('expenses-channel')
    expenseChannel.listen('.ExpenseUpdated', (e: any) => {
      const { expense, type } = e
      if (type === 'created') dispatch(addExpense(expense))
      if (type === 'updated') dispatch(updateExpense(expense))
      if (type === 'deleted') dispatch(archiveExpense(expense))
      if (type === 'restored') dispatch(restoreExpense(expense))
      if (type === 'force_deleted') dispatch(removeExpenseRecord(expense.id))
    })

    return () => {
      echo.leaveChannel('clusters-channel')
      echo.leaveChannel('barangays-channel')
      echo.leaveChannel('farmers-channel')
      echo.leaveChannel('fisherfolks-channel')
      echo.leaveChannel('cooperatives-channel')
      echo.leaveChannel('crops-channel')
      echo.leaveChannel('plantings-channel')
      echo.leaveChannel('harvests-channel')
      echo.leaveChannel('fisheries-channel')
      echo.leaveChannel('expenses-channel')
    }

  }, [dispatch])

  return null
}

export default RealtimeListener
