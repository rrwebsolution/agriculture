import echo from '../plugin/echo'
import { store } from '../store/store'
import { 
  addPlantingRecord, 
  updatePlantingRecord, 
  deletePlantingRecord 
} from '../store/slices/plantingSlice'

export const initPlantingRealtime = () => {

  // ==========================================
  // 1. LISTENER PARA SA PLANTING LOGS
  // ==========================================
  echo.leaveChannel('plantings-channel');

  echo.channel('plantings-channel')
    .listen('.PlantingUpdated', (e: any) => {
      const { planting, action } = e;

      if (!planting) return; 
      
      // console.log("🌱 REALTIME PLANTING DATA RECEIVED:", action, planting);

      switch (action) {
        case 'created':
          store.dispatch(addPlantingRecord(planting));
          // I-force update ang nested objects para sa dropdowns (Farmer, Barangay, Crop)
          if (planting.farmer) store.dispatch(updatePlantingRecord({ farmer: planting.farmer }));
          if (planting.barangay) store.dispatch(updatePlantingRecord({ barangay: planting.barangay }));
          if (planting.crop) store.dispatch(updatePlantingRecord({ crop: planting.crop }));
          break;

        case 'updated':
          store.dispatch(updatePlantingRecord(planting));
          // I-force update ang nested objects para sa dropdowns (Farmer, Barangay, Crop)
          if (planting.farmer) store.dispatch(updatePlantingRecord({ farmer: planting.farmer }));
          if (planting.barangay) store.dispatch(updatePlantingRecord({ barangay: planting.barangay }));
          if (planting.crop) store.dispatch(updatePlantingRecord({ crop: planting.crop }));
          break;

        case 'deleted':
          const idToDelete = planting.id || planting;
          store.dispatch(deletePlantingRecord(idToDelete));
          break;

        default:
          console.warn(`Unknown action received: ${action}`);
      }
    });

  // ==========================================
  // 2. LISTENER PARA SA FARMERS (Para sa Dropdowns & Table)
  // ==========================================
  echo.leaveChannel('farmers-channel');

  echo.channel('farmers-channel')
    .listen('.FarmerUpdated', (e: any) => {
      console.log("🧑‍🌾 REALTIME FARMER DATA RECEIVED:", e);
      
      const { farmer, type } = e;
      if (!farmer) return;

      if (type === 'created' || type === 'updated') {
        store.dispatch(updatePlantingRecord({ farmer: farmer }));
      }
    });

  // ==========================================
  // 3. LISTENER PARA SA BARANGAYS (Para sa Dropdowns & Table)
  // ==========================================
  echo.leaveChannel('barangays-channel');

  echo.channel('barangays-channel')
    .listen('.BarangayUpdated', (e: any) => {
      console.log("🏘️ REALTIME BARANGAY DATA RECEIVED:", e);

      const { barangay, type } = e;
      if (!barangay) return;

      if (type === 'created' || type === 'updated') {
        store.dispatch(updatePlantingRecord({ barangay: barangay }));
      } else if (type === 'deleted') {
        const idToDelete = barangay.id || barangay;
        store.dispatch(updatePlantingRecord({ deleted_barangay_id: idToDelete }));
      }
    });

  // ==========================================
  // 🌟 4. LISTENER PARA SA CROPS (Para sa Dropdowns & Table)
  // ==========================================
  echo.leaveChannel('crops-channel');

  echo.channel('crops-channel')
    .listen('.CropUpdated', (e: any) => {
      console.log("🌾 REALTIME CROP DATA RECEIVED:", e);

      const { crop, type } = e;
      if (!crop) return;

      if (type === 'created' || type === 'updated') {
        // Ipadala ang crop data sa slice aron ma-update ang dropdown ug table column
        store.dispatch(updatePlantingRecord({ crop: crop }));
      } else if (type === 'deleted') {
        // I-handle ang deleted crop kung kinahanglan
        const idToDelete = crop.id || crop;
        store.dispatch(updatePlantingRecord({ deleted_crop_id: idToDelete }));
      }
    });
}