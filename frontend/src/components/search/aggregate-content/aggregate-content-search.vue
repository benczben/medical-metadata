<template>
	<form>
	<!-- loinc selector as a structure -->
	<loinc-code-selector
		:clear="forceRenderCounter"
		:singleSelect="true"
		@emitLoincCode="setLoincTermsSelectedBoolean"
		@alert="handleError"
	>
	</loinc-code-selector>

	<!-- content based descriptors -->
	<content-descriptors
		:clear="forceRenderCounter"
		:scalingKey="scalingKey"
		:nominalValuesSelected.sync="nominalValuesSelected"
		:loadingFinished.sync="loadingFinished"
		:ordinalValueRangeBounds.sync="ordinalValueRangeBounds"
		:selectedDocumentScaling.sync="selectedDocumentScaling"
		:selectedNarrativeScaling.sync="selectedNarrativeScaling"
		:loincTermsSelected="loincTermsSelected"
		:rangeSelectorSliderValues.sync="rangeSelectorSliderValues"
	>
	</content-descriptors>

	<v-btn v-show="loincTermIsSelected" class="mr-4" @click="submit"> {{txt.btn.submit}} </v-btn>
	<v-btn @click="clear"> {{txt.btn.clear}} </v-btn>
	
	<!-- barchart -->
	<barchart-wrapper
		style="padding-top: 35px;"
		:barChartRenderCounter="barChartRenderCounter"
		:showBarChart="show.barChart"
		:dataSourcesArray="dataSourcesArray"
		:mappedDataRes="mappedDataRes"
	/>
	
	
</form>
</template>

<script>
import axios from 'axios'
import config from '../../../config'
import barchartWrapper from '../barchart-wrapper.vue'
import loincCodeSelector from '../loinc-code-selector.vue'
import contentDescriptors from '../content-descriptors.vue'

export default {
	components: {
		barchartWrapper,
		loincCodeSelector,
		contentDescriptors,
	},
	name: 'aggregateContentSearch',
	props: {
		alert: {
			type: Object
		}
	},
	data(){
		return {
			forceRenderCounter: 0,
			fsn: [],
			mappedDataFromDataSource: [],
			rangeSelectorSliderValues: [0, 0],
			loadingFinished: false,
			nominalValuesSelected: [],
			ordinalValueRangeBounds: [0, 1],
			selectedDocumentScaling: [],
			selectedNarrativeScaling: [],
			dataSourcesArray: [],
			mappedDataRes: [],
			barChartRenderCounter: 0,
			loincTermsSelected: [],
			scalingKey: '',
			show: {
				collectionList: false,
				resultList: false,
				barChart: false,
			},
			txt:{
				btn: {
					clear: 'clear',
					submit: 'submit search'
				}
			} 
		}
	},
	computed: {
		loincTermIsSelected() {
			return (this.loincTermsSelected.length > 0) ? true : false
		}
	},
	methods: {
		async submit() {
			if (this.loincTermsSelected && this.loincTermsSelected.length > 0) {
				this.loincTermsSelected.map(async (x) => {
				if(this.fsn.SCALE_TYP.toUpperCase() == 'QN'){
					this.mappedDataRes = await axios.get(config.localApi + "/meta-data", 
					{
					params: {
						scaling: 'qn',
						loinc_code: x.loinc_code,
						lower_bound: this.rangeSelectorSliderValues[0],
						upper_bound: this.rangeSelectorSliderValues[1]
					}
					})
					this.mappedDataFromDataSource.push(this.mappedDataRes.data)
				}
				
				if(this.fsn.SCALE_TYP.toUpperCase() == 'NOM'){
					this.mappedDataRes = await axios.get(config.localApi + "/meta-data", 
					{
						params: {
						scaling: 'nom',
						loinc_code: x.loinc_code,
						value_restriction_list: this.nominalValuesSelected
						}
					})
					this.mappedDataFromDataSource.push(this.mappedDataRes.data)
				}

				if(this.fsn.SCALE_TYP.toUpperCase() == 'ORD'){
					this.mappedDataRes = await axios.get(config.localApi + "/meta-data", 
					{
					params: {
						scaling: 'ord',
						loinc_code: x.loinc_code,
						lower_bound: this.ordinalValueRangeBounds[0],
						upper_bound: this.ordinalValueRangeBounds[1]
						}
					})
					this.mappedDataFromDataSource.push(this.mappedDataRes.data)
				}

				if(this.fsn.SCALE_TYP.toUpperCase() == 'DOC'){
					this.mappedDataRes = await axios.get(config.localApi + "/meta-data", 
					{
						params: {
						scaling: 'doc',
						loinc_code: x.loinc_code,
						selectedFilter: this.selectedDocumentScaling,
						}
					})
					this.mappedDataFromDataSource.push(this.mappedDataRes.data)
				}

				if(this.fsn.SCALE_TYP.toUpperCase() == 'NAR'){
					this.mappedDataRes = await axios.get(config.localApi + "/meta-data", 
					{
						params: {
						scaling: 'nar',
						loinc_code: x.loinc_code,
						selectedFilter: this.selectedNarrativeScaling,
						}
					})
					this.mappedDataFromDataSource.push(this.mappedDataRes.data)
				}
				let datasourcesRetrieved = this.mappedDataRes.data.map(data => data.source_database)
				for(let datasource of datasourcesRetrieved){
					if(!this.dataSourcesArray.includes(datasource))
					this.dataSourcesArray.push(datasource)
				}
				this.show.barChart = true
				this.show.resultList = false
				this.barChartRenderCounter += 1
				})
			}
		},
		async setLoincTermsSelectedBoolean(loincTermsSelected){
			this.loincTermsSelected = loincTermsSelected
			this.loincTermsSelected.map(async (x) => {
				console.log(x.loinc_code)
				let loincFsnRes = await axios.get(
					config.localApi + "/loinc-fsn",
					{
					params: {
						loinc_code: x.loinc_code,
					},
					}
				)
				this.fsn = loincFsnRes.data
				this.scalingKey = loincFsnRes.data.SCALE_TYP
				this.loadingFinished = true
			})
		},
		async clear() {
			this.show.barChart = false
			this.fsn = []
			this.mappedDataFromDataSource = []
			this.forceRenderCounter += 1 
		},
		handleError(error){
			this.$emit('error', error)
		}
	},
}
</script>

<style>

.resultList{
	margin-top: 28px;
}

</style>