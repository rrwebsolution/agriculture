import echo from '../plugin/echo'
import { store } from '../store/store'
import { 
  addBarangay,
  updateBarangayRecord,
  deleteBarangay 
} from '../store/slices/barangaySlice'

export const initBarangayRealtime = () => {

  // 🌟 Step 1: Siguroa nga limpyo ang channel sa dili pa maminaw
  // Kini aron dili mag-doble ang imong nadawat nga data kung mag-re-init ang app.
  echo.leaveChannel('barangays-channel');

  echo.channel('barangays-channel')
    .listen('.BarangayUpdated', (e: any) => {

      // 🐛 Step 2: Debugging - Tan-awa sa F12 Console kung na-receive ba ang data
      console.log("🏘️ BARANGAY REALTIME DATA RECEIVED:", e);

      const { barangay, type } = e;
      if (!barangay) return;

      switch (type) {
        case 'created':
          // I-dispatch ang pag-add sa bag-ong barangay
          store.dispatch(addBarangay(barangay));
          break;

        case 'updated':
          // 🌟 Tungod kay "lite" payload ang gipadala sa backend (basic info + counts),
          // ang atong barangaySlice.ts na ang bahala mo-merge niini sa existing data 
          // gamit ang index logic nga atong gihimo ganiha.
          store.dispatch(updateBarangayRecord(barangay));
          break;

        case 'deleted':
          // Siguroa nga makuha ang ID maski object o numero lang ang gipadala
          const idToDelete = barangay.id || barangay;
          store.dispatch(deleteBarangay(idToDelete));
          break;

        default:
          console.warn(`Unknown barangay action type: ${type}`);
      }
    });

}