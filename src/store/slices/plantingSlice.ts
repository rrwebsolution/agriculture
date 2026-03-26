import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PlantingState {
  records: any[];
  farmers: any[];
  barangays: any[];
  crops: any[];
  isLoaded: boolean;
}

const initialState: PlantingState = {
  records: [],
  farmers: [],
  barangays: [],
  crops: [],
  isLoaded: false,
};

const plantingSlice = createSlice({
  name: 'planting',
  initialState,
  reducers: {
    setPlantingData: (state, action: PayloadAction<any>) => {
      state.records = action.payload.records;
      state.farmers = action.payload.farmers;
      state.barangays = action.payload.barangays;
      state.crops = action.payload.crops;
      state.isLoaded = true;
    },

    addPlantingRecord: (state, action: PayloadAction<any>) => {
      const exists = state.records.find(r => Number(r.id) === Number(action.payload.id));
      if (!exists) {
        state.records.unshift(action.payload);
      }
    },

    updatePlantingRecord: (state, action: PayloadAction<any>) => {
      const payload = action.payload;
      
      // =====================================
      // 1. UPDATE KUNG PLANTING RECORD ANG NIABOT
      // =====================================
      if (payload.id && payload.date_planted) {
        const index = state.records.findIndex(r => Number(r.id) === Number(payload.id));
        if (index !== -1) {
          state.records[index] = payload;
        }
      }

      // =====================================
      // 2. UPDATE KUNG FARMER DATA ANG NIABOT
      // =====================================
      if (payload.farmer) {
        const farmerId = Number(payload.farmer.id);
        
        // Update sa Dropdown
        const farmerIndex = state.farmers.findIndex(f => Number(f.id) === farmerId);
        if (farmerIndex !== -1) {
          state.farmers[farmerIndex] = { ...state.farmers[farmerIndex], ...payload.farmer };
        } else {
          state.farmers.unshift(payload.farmer);
        }

        // Update Table
        state.records = state.records.map(record => {
          let newRecord = JSON.parse(JSON.stringify(record)); 
          if (Number(newRecord.farmer_id) === farmerId) {
            newRecord.farmer = { ...newRecord.farmer, ...payload.farmer };
          }
          return newRecord;
        });
      }

      // =====================================
      // 🌟 3. UPDATE KUNG BARANGAY DATA ANG NIABOT
      // =====================================
      if (payload.barangay) {
        const brgyId = Number(payload.barangay.id);

        // A. Update sa Dropdown List (state.barangays)
        const brgyIndex = state.barangays.findIndex(b => Number(b.id) === brgyId);
        if (brgyIndex !== -1) {
          state.barangays[brgyIndex] = { ...state.barangays[brgyIndex], ...payload.barangay };
        } else {
          state.barangays.push(payload.barangay);
        }

        // B. 🔥 PUGSON OG UPDATE ANG PLANTING TABLE 
        state.records = state.records.map(record => {
          // JSON.stringify aron pugson ang React pag-detect sa update
          let newRecord = JSON.parse(JSON.stringify(record));

          // UPDATE PRIORITY 1: Kung ang record naa ani nga barangay_id
          if (Number(newRecord.barangay_id) === brgyId) {
            if (!newRecord.barangay) newRecord.barangay = {};
            newRecord.barangay.name = payload.barangay.name; 
          }

          // UPDATE PRIORITY 2: Kung ang nested farmer info nagkupot sa barangay name
          if (newRecord.farmer) {
            if (Number(newRecord.farmer.barangay_id) === brgyId || Number(newRecord.farmer.farm_barangay_id) === brgyId) {
               
               if (newRecord.farmer.barangay) {
                 newRecord.farmer.barangay.name = payload.barangay.name;
               }
               
               if (newRecord.farmer.farm_location) {
                 newRecord.farmer.farm_location.name = payload.barangay.name;
               }
            }
          }

          return newRecord;
        });

        // C. 🔥 PUGSON OG UPDATE ANG FARMERS DROPDOWN (Ang mga pangalan sa farm location)
        state.farmers = state.farmers.map(farmer => {
           let newFarmer = JSON.parse(JSON.stringify(farmer));
           if (Number(newFarmer.barangay_id) === brgyId || Number(newFarmer.farm_barangay_id) === brgyId) {
              if (newFarmer.barangay) newFarmer.barangay.name = payload.barangay.name;
              if (newFarmer.farm_location) newFarmer.farm_location.name = payload.barangay.name;
           }
           return newFarmer;
        });
      }

      if (payload.crop && !payload.date_planted) { // !date_planted aron sure nga Crop event ni, dili Planting event
        const cropId = Number(payload.crop.id);

        // A. Update sa Dropdown List (state.crops)
        const cIndex = state.crops.findIndex(c => Number(c.id) === cropId);
        if (cIndex !== -1) {
          state.crops[cIndex] = { ...state.crops[cIndex], ...payload.crop };
        } else {
          state.crops.push(payload.crop);
        }

        // B. 🔥 PUGSON OG UPDATE ANG PLANTING TABLE
        state.records = state.records.map(record => {
          let newRecord = JSON.parse(JSON.stringify(record));
          
          if (Number(newRecord.crop_id) === cropId) {
             if (!newRecord.crop) newRecord.crop = {};
             newRecord.crop.category = payload.crop.category; // I-update ang category name
          }
          return newRecord;
        });
      }

      // =====================================
      // 4. KUNG NA-DELETE ANG BARANGAY
      // =====================================
      if (payload.deleted_barangay_id) {
         state.barangays = state.barangays.filter(b => Number(b.id) !== Number(payload.deleted_barangay_id));
      }
    },

    deletePlantingRecord: (state, action: PayloadAction<number>) => {
      state.records = state.records.filter(r => Number(r.id) !== Number(action.payload));
    },
  },
});

export const {
  setPlantingData,
  addPlantingRecord,
  updatePlantingRecord, 
  deletePlantingRecord
} = plantingSlice.actions;

export default plantingSlice.reducer;