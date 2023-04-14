<template>
	<form>
		<!-- loinc selector as a structure -->
		<loinc-code-selector
			:singleSelect="true"
			@emitLoincCode="setLoincTermsSelectedBoolean"
		>
		</loinc-code-selector>
		

		<v-row style="height: 150px; padding-top: 25px;">
			<v-col md="3">
				<v-select
					v-model="qualitySearchSelected"
					:items="qualitySearchOptions"
					:item-text="item => item.value"
					label="Metadata Quality Metrics"
					return-object
				/>
			</v-col>
			<v-col md="9">
				<!-- completeness range slider -->
				<div v-show="show.quality.comp">
					<p>Set the completeness range. The values stand for percentage.</p>
					<range-slider
						:rangeSelectorSliderValues.sync="rangeSelectorSliderValuesComp"
						:rangeSelectorMinValue="0"
						:rangeSelectorMaxValue="100"
						:step="5"
					/>
				</div>

				<!-- accuracy select -->
				<v-select
					v-show="show.quality.acc"
					v-model="accuracySupportSelected"
					:items="accuracySupport"
					multiple
					label="Search according the metadata accuracy of the selected LOINC code"
				/>
				<v-row>
					<v-col md="3">
						<!-- timeliness select -->
						<v-select
							v-show="show.quality.time"
							v-model="timelinessSelected"
							:items="timelinessGropings"
							:item-text="item => item.value"
							single
							return-object
							label="Select the timeliness unit"
						/>
					</v-col>
					<v-col md="9">
						<div v-show="show.quality.time">
							<p>Set the timeliness range in <b>{{timelinessSelected.value.toLowerCase()}}</b></p>
							<range-slider
								:rangeSelectorSliderValues.sync="rangeSelectorSliderValuesTime"
								:rangeSelectorMinValue="rangeSelectorSliderValuesTime[0]"
								:rangeSelectorMaxValue="rangeSelectorSliderValuesTime[1]"
								:forceRender="forceRenderRangeCounter"
								:disabled="false"
								:step="1"
							/>
						</div>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
		
		<v-btn v-show="show.quality.comp" class="mr-4" @click="submitComp"> {{txt.btn.submit}} </v-btn>
		<v-btn v-show="show.quality.acc" class="mr-4" @click="submitAcc"> {{txt.btn.submit}} </v-btn>
		<v-btn v-show="show.quality.time" class="mr-4" @click="submitTime"> {{txt.btn.submit}} </v-btn>
		
		<!-- completeness barchart -->
		<div v-if="show.quality.comp">
			<barchart-wrapper
				:barChartRenderCounter="forceRenderCounter"
				:showBarChart="show.quality.comp"
				:dataSourcesArray="dataSourcesArray"
				:mappedDataRes="completenessData"
				:qualityChart="true"
				:yLabel="'Percentage'"
				:xLabel="'Collection'"
				:datasetLabel="'Completeness for LOINC'"
				:XAxesPropertyName="'standard_metadata_completeness'"
				:tooltipInfoFor="['collection_completeness']"
				:tooltipInfoForLabel="'Collection comp.'"
			/>
		</div>

		<!-- accuracy barchart -->
		<barchart-wrapper
			:barChartRenderCounter="forceRenderCounter"
			:showBarChart="show.quality.acc"
			:dataSourcesArray="dataSourcesArray"
			:mappedDataRes="accuracyData"
			:qualityChart="true"
			:yLabel="'Occurance'"
			:xLabel="'Value'"
			:datasetLabel="'Accuracy count for group'"
			:XAxesPropertyName="'occurance_count'"
			:tooltipInfoFor="['collection_accuracy']"
			:tooltipInfoForLabel="'Weighted collection metadata acc.'"
		/>

		<!-- timeliness barchart -->
		<div v-if="show.quality.time">
			<barchart-wrapper
				:barChartRenderCounter="forceRenderCounter"
				:showBarChart="show.quality.time"
				:dataSourcesArray="timelinessLabels"
				:mappedDataRes="timelinessData"
				:qualityChart="true"
				:yLabel="'Occurance count'"
				:xLabel="'Data Source'"
				:datasetLabel="'Timeliness for LOINC count'"
				:XAxesPropertyName="'occurance_count'"
				:tooltipInfoFor="['source_database']"
				:tooltipInfoForLabel="'Collection timeliness'"
				:timelinessUnit="this.timelinessSelected.value"
			/>
		</div>

	</form>
</template>

<script>
import axios from 'axios'
import config from '../../../config'
import loincCodeSelector from '../loinc-code-selector.vue'
import rangeSlider from './range-slider.vue'
import barchartWrapper from '../barchart-wrapper.vue'

export default {
	name: 'qualityBasedSearch',
	components: {
		loincCodeSelector,
		rangeSlider,
		barchartWrapper,
	},
	props: {
		alert: {
			type: Object
		}
	},
	data(){
		return {
			forceRenderCounter: 0,
			forceRenderRangeCounter: 0,
			loincTermsSelected: [],
			qualitySearchOptions: [
				{ key: 'comp', value: 'Completeness'},
				{ key: 'acc', value: 'Accuracy'},
				{ key: 'time', value: 'Timeliness'},
			],
			qualitySearchSelected: { key: 'comp', value: 'Completeness'},
			// completeness
			rangeSelectorSliderValuesComp: [0, 100],
			completenessData: [],
			dataSourcesArray: [],
			/// acuracy 
			accuracySupport: ['high', 'medium', 'low'],
			accuracySupportSelected: [],
			accuracyData: [],
			// timeliness 
			timelinessGropings: [
				{ key: 'day', value: 'Days'},
				{ key: 'month', value: 'Months'},
				{ key: 'year', value: 'Years'},
			],
			timelinessSelected: { key: 'day', value: 'Days'},
			rangeSelectorSliderValuesTimeSelected: [0, 365],
			timelinessData: [],
			timelinessLabels: [],
			// other
			show: {
				quality: {
					comp: true,
					acc: false,
					time: false,
				},
				resultList: false,
			},
			txt:{
				btn: {
					submit: 'submit search'
				}
			} 
		}
	},
	watch: {
		"qualitySearchSelected": {
			handler: function() {
				this.loadQualitySearchSelector()
			}
		},
		"rangeSelectorSliderValuesTime": {
			handler: function (){
				this.forceRenderRange()
			} 
		}
	},
	computed: {
		rangeSelectorSliderValuesTime: {
			get: function () {
				let range = [0, 100]
				switch (this.timelinessSelected.key) {
					case 'day':
						range = [0, 365]
						break
					case 'month':
						range = [0, 36]
						break
					case 'year':
						range = [0, 50]
						break
					default:
						range = [0, 100]
						break
				}
				return range
			},
			set: function (newValue) {
				this.rangeSelectorSliderValuesTimeSelected = newValue
			}
		}
	},
	methods: {
		async setLoincTermsSelectedBoolean(loincTermsSelected){
			this.loincTermsSelected = loincTermsSelected[0]
		},
		async loadQualitySearchSelector() {
			switch (this.qualitySearchSelected.key) {
				case 'acc':
					this.showSelector('acc')
					break
				case 'comp':
					this.showSelector('comp')
					break
				case 'time':
					this.showSelector('time')
					break
				default: console.log('unknown selection')
					break
			}
		},
		showSelector(selected){
			for (const key of Object.keys(this.show.quality)) {
				if(key == selected) this.show.quality[key] = true
				else this.show.quality[key] = false
			}
		},
		async submitComp() {
			let completenessRes = await axios.get(
				config.localApi + "/metadata/quality-completeness", {
					params: {
						loincCode: this.loincTermsSelected.loinc_code,
						lowerBound: this.rangeSelectorSliderValuesComp[0],
						upperBound: this.rangeSelectorSliderValuesComp[1]
					},
				}
			)
			this.completenessData = completenessRes
			this.dataSourcesArray = completenessRes.data.map(x => x.source_database)
			if(completenessRes.data && completenessRes.data.length == 0){
				this.$emit("error", "No data for these filters")
			}
			this.forceRenderCounter += 1
		},
		async submitAcc() {
			let accuracyRes = await axios.get(
				config.localApi + "/metadata/quality-accuracy", {
					params: {
						loincCode: this.loincTermsSelected.loinc_code,
						accuracy: this.accuracySupportSelected
					},
				}
			)
			this.accuracyData = accuracyRes
			this.dataSourcesArray = accuracyRes.data.map(x => x.source_database)
			if(accuracyRes.data && accuracyRes.data.length == 0){
				this.$emit("error", "No data for these filters")
			}
			this.forceRenderCounter += 1
		},
		async submitTime() {
			let timelinessRes = await axios.get(
				config.localApi + "/metadata/quality-timeliness", {
					params: {
						loincCode: this.loincTermsSelected.loinc_code,
						lowerBound: this.rangeSelectorSliderValuesTimeSelected[0],
						upperBound: this.rangeSelectorSliderValuesTimeSelected[1],
						timelinessUnit: this.timelinessSelected.key
					},
				}
			)
			this.timelinessData = timelinessRes
			this.dataSourcesArray = timelinessRes.data.map(x => x.source_database)
			this.timelinessLabels = timelinessRes.data.map(x => x.timeliness)
			if(timelinessRes.data && timelinessRes.data.length == 0){
				this.$emit("error", "No data for these filters")
			}
			this.forceRenderCounter += 1
		},
		handleError(error){
			this.$emit('error', error)
		},
		forceRenderRange(){
			setTimeout(() => {
				this.forceRenderRangeCounter += 1
			}, 100)
		}
	},
	onload(){
		this.loadQualitySearchSelector()
	}
}
</script>

<style>

</style>