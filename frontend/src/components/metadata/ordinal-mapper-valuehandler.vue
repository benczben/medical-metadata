<template>
	<div>
		<v-form>
			<h5 class="headerFive">{{txt.pickSet}}</h5>
			<v-alert
				v-if="showMessageBoolean"
				dense
				:type="alertType"
			>{{alertText}}</v-alert>
			 <v-progress-linear
			 	v-show="isLoading"
				indeterminate
				color="blue"
			></v-progress-linear>
			<v-autocomplete 
				class="mx-10"
				@click="getOrdinalValueSetsForLoinc"
				@change="createListOfValueSetValues"
				:items="ordinalMappingValueSetNames"
				v-model="selectedOrdinalMappingValueSet"
				counter
				label="Pick a value set for the mapping"
			></v-autocomplete> 
			<v-list>
				<v-list-item-title v-if="selectedOrdinalMappingValueSet && selectedOrdinalMappingValueSet.length > 0">Values of {{selectedOrdinalMappingValueSet}}:</v-list-item-title>
					<draggable-list-ordinal
						:ordinalMappingValueSetArray="ordinalMappingValueSetArray"
						:selectedOrdinalMappingValueSet="selectedOrdinalMappingValueSet"
						@chengedOrderOfValueSetArray="saveChangedOrderOfValueSetArray"
						@orderChangeActivated="showMessage"
					></draggable-list-ordinal>
			</v-list>
		</v-form>
	</div>	
</template>

<script>
import axios from 'axios'
import config from "../../config"
import draggableListOrdinal from './draggable-list-ordinal.vue'

export default {
	components: { draggableListOrdinal },
    name: "OrdinalMapperValuehandler",
    props: {
		ordinalDistinctValues: {
			type: Array
		},
    },
    data: () => ({
		txt: {
			pickSet: "Pick a set of values to which the current values should be mapped. If your desired value set is not in the list, please send us a formal request.",
			addNewDataSet: "Add new dataset",
		},
		ordinalMappingValueSetArray: [],
		ordinalMappingValueSetNames: [],
		selectedOrdinalMappingValueSet: '',
		showMessageBoolean: false,
		alertType: 'info',
		isLoading: false,
    }),
    methods: {
		async getOrdinalValueSetsForLoinc(){
			try {   
				let res = await axios.get(config.localApi + "/metadata/ordinal-valuesets-for-loinc", 
				{
					params: {
						loincCode: this.ordinalDistinctValues[0].loinc_code
					}
				})
				this.ordinalMappingValueSetNames = res.data.map(x => x.value_set_name)
			} catch (error) {
				this.showMessage(error, 'error')
			}
		},
		async createListOfValueSetValues(){
			try {   
				let res = await axios.get(config.localApi + "/metadata/ordinal-valuesets-values", 
				{
					params: {
						loincCode: this.ordinalDistinctValues[0].loinc_code,
						valueSetName: this.selectedOrdinalMappingValueSet
					}
				})
				this.ordinalMappingValueSetArray = res.data
				this.ordinalMappingValueSetValues = res.data.map(x => x.value_set_value)
				this.$emit('ordinalMappingValueSetValues', this.ordinalMappingValueSetValues)
			} catch (error) {
				this.showMessage(error, 'error')
			}
		},
		async saveChangedOrderOfValueSetArray(changedOrderOfValueSetArray){
			this.isLoading = true;
			try {   
				let res = await axios.post(config.localApi + "/metadata/ordinal-valuesets-values", 
				{
					changedOrderOfValueSetArray: changedOrderOfValueSetArray
				})
				this.createListOfValueSetValues()
				this.showMessage(res.data.message + ', updated rows: ' + res.data.rowCount, 'success')
			} catch (error) {
				this.showMessage(error, 'error')
			}
			this.isLoading = false
		},
		showMessage(alertText, alertType){
            this.showMessageBoolean = true
			this.alertType = alertType
			this.alertText = alertText
			setTimeout(() => {
				this.showMessageBoolean = false
			}, 4000)
		}
    }
}
</script>

<style scoped>
.headerFive{
	padding-bottom: 20px;
}
</style>