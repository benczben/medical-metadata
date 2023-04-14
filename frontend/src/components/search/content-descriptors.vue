<template>
	<div>
		<v-alert v-show="alert.message.length > 0" :type="alert.type">{{alert.message}}</v-alert>
		<v-range-slider
			v-show="loincTermsSelectedQn && rangeSelectorMinValue && rangeSelectorMaxValue"
			v-model="rangeSelectorSliderValuesLocal"
			:min="rangeSelectorMinValue"
			:max="rangeSelectorMaxValue"
			step="0.01"
			hide-details
			class="align-center"
		>
            <template v-slot:prepend>
				<v-text-field
					:value="rangeSelectorSliderValuesLocal[0]"
					class="mt-0 pt-0"
					hide-details
					single-line
					type="number"
					style="width: 60px"
					@change="$set(rangeSelectorSliderValuesLocal, 0, $event)"
				></v-text-field>
			</template>
			<template v-slot:append>
				<v-text-field
				:value="rangeSelectorSliderValuesLocal[1]"
				class="mt-0 pt-0"
				hide-details
				single-line
				type="number"
				style="width: 60px"
				@change="$set(rangeSelectorSliderValuesLocal, 1, $event)"
				></v-text-field>
			</template>
		</v-range-slider>

		<v-autocomplete
			v-show="loincTermsSelectedNom"
			:items="selectListForNominalValues"
			item-text="distinct_values"
			item-key="distinct_values"
			label="Nominal value selection"
			v-model="nominalValuesSelectedLocal"
			multiple
			return-object
			chips
			@change="emitModelNominal"
			>
		</v-autocomplete>

		<!-- ORDINAL values range slider -->
		<v-range-slider
			v-model="ordinalValueRangeBoundsLocal"
			v-show="loincTermsSelectedOrd"
			:tick-labels="ordinalValueRangeArray"
			:value="[0, 1]"
			min="1"
			:max="ordinalValueRangeArray.length"
			ticks="always"
			tick-size="1"
			@change="emitOrdinalRangeBounds"
			>
			<template v-slot:thumb-label="item">
				{{item.value}}
			</template>
		</v-range-slider>

		<!-- Document values -->
		<v-autocomplete
			item-text="text"
			item-value="key"
			:items="documentSelectValues"
			v-model="selectedDocumentScalingLocal"
			label="Document scaled values"
			v-show="loincTermsSelectedDoc"
			multiple
			chips
			@change="emitDocValueScaling"
		></v-autocomplete>

		<!-- Narrative values -->
		<v-autocomplete
			item-text="text"
			item-value="key"
			:items="narrativeSelectValues"
			v-model="selectedNarrativeScalingLocal"
			label="Narrative scaled values"
			v-show="loincTermsSelectedNar"
			multiple
			chips
			@change="emitNarValueScaling"
		></v-autocomplete>
  	</div>
</template>

<script>
import axios from 'axios'
import config from "../../config"

export default {
	name: 'contentDescriptors',
	props: {
		scalingKey: {
			type: String,
		},
		nominalValuesSelected: {
			type: Array
		},
		loadingFinished: {
			type: Boolean
		},
		ordinalValueRangeBounds: {
			type: Array
		},
		selectedDocumentScaling: {
			type: Array
		},
		selectedNarrativeScaling: {
			type: Array
		},
		loincTermsSelected: {},
		rangeSelectorSliderValues: {},
		clear: {
			type: Number
		}
	},
	data() {
		return{
			loincTermsSelectedQn: false,
    		loincTermsSelectedNom: false,
			loincTermsSelectedOrd: false,
			loincTermsSelectedDoc: false,
			loincTermsSelectedNar: false,
			rangeSelectorMinValue: 0,
    		rangeSelectorMaxValue: 100,
			selectListForNominalValues: [],
			nominalValuesSelectedLocal: this.nominalValuesSelected,
			loadingFinishedLocal: this.loadingFinished,
			rangeSelectorSliderValuesLocal: this.rangeSelectorSliderValues,
			ordinalValueRangeArray: [],
			ordinalValueRangeBoundsLocal: this.ordinalValueRangeBounds,
			documentSelectValues: [
				{
					text: 'Entries with document data',
					key: 'exists'
				},
				{
					text: 'Entries without document data',
					key: 'notExists'
				}
			],
			selectedDocumentScalingLocal: this.selectedDocumentScaling,
			narrativeSelectValues: [
				{
					text: 'Entries with narrative data',
					key: 'exists'
				},{
					text: 'Entries without narrative data',
					key: 'notExists'
				}
			],
			selectedNarrativeScalingLocal: this.selectedNarrativeScaling,
			scalingOfSelectedFilter: "",
			alert: {
				type: 'info',
				message: ''
			}
		}
	},
	computed: {
		scalingKeyLocal: function () {
			return this.scalingKey.toUpperCase()
		}
	},
	watch:{
		scalingKeyLocal: {
			handler: async function() {
				await this.scalingDependentSelectorShowVariableSetter()
			}
		},
		loincTermsSelected: {
			handler: async function() {
				await this.scalingDependentSelectorShowVariableSetter()
			}
		},
		rangeSelectorSliderValuesLocal: {
			handler: function() {
				this.emitRangeSelctorSliderValues()
			}
		},
		clear: {
			handler: function() {
				this.clearUp()
			}
		}
	},
	methods: {
		async scalingDependentSelectorShowVariableSetter(){
			this.loincTermsSelectedQn = false
			this.loincTermsSelectedNom = false
			this.loincTermsSelectedOrd = false
			this.loincTermsSelectedDoc = false
			this.loincTermsSelectedNar = false
			this.loadingFinishedLocal = false
			if(this.scalingKeyLocal == 'QN'){
				this.loincTermsSelectedQn = true
				await this.getColumnValueRanges()
			} else if(this.scalingKeyLocal == 'NOM'){
				this.loincTermsSelectedNom = true
				await this.getColumnValuesNominal()
			} else if(this.scalingKeyLocal == 'ORD'){
				this.loincTermsSelectedOrd = true
				await this.getColumnValuesOrdinal()
			} else if(this.scalingKeyLocal == 'DOC'){
				this.loincTermsSelectedDoc = true
				//await this.getColumnValuesDocument()
			} else if(this.scalingKeyLocal == 'NAR'){
				this.loincTermsSelectedNar = true
				//await this.getColumnValuesNarrative()
			} else {
				console.log("THIS SCALING TYPE IS NOT HANDLED: " + this.scalingKeyLocal)
			}
			this.$emit('update:loadingFinished', this.loadingFinishedLocal)
		},
		async getColumnValueRanges() {
			try {
				let valueRangesRes = await axios.get(config.localApi + "/loinc-value-ranges", {
						params: {
							loinc_code: this.loincTermsSelected[0].loinc_code
						}
					}
				)

				if(valueRangesRes.data && valueRangesRes.data.max_value && valueRangesRes.data.max_value !== null && valueRangesRes.data.min_value && valueRangesRes.data.min_value !== null){
					this.rangeSelectorMaxValue = valueRangesRes.data.max_value
					this.rangeSelectorMinValue = valueRangesRes.data.min_value
					this.setMessage('', 'info')
				} else {
					this.setMessage('No range selection is possible for this filter.', 'warning')
				}
			} catch (error) {
				console.log(error)
			}
		},
		getColumnValuesNominal() {
			try {
				this.loincTermsSelected.map(async (x) => {
				console.log(x.loinc_code)
				let valuesRes = await axios.get(config.localApi + "/column-values-nominal", 
				{
					params: {
					loinc_code: x.loinc_code
					}
				})
				this.selectListForNominalValues = valuesRes.data
				})
			} catch (error) {
				console.log(error)
			}
		},
		getColumnValuesOrdinal() {
			try {
				this.loincTermsSelected.map(async (x) => {
				console.log(x.loinc_code)
				let valuesRes = await axios.get(config.localApi + "/column-values-ordinal", 
				{
					params: {
						loinc_code: x.loinc_code,
						scaling: this.scalingOfSelectedFilter
					}
				})
				
				this.ordinalValueRangeArray = valuesRes.data.map(res => res.value_set_value)
				})
			} catch (error) {
				console.log(error)
			}
		},
		emitModelNominal(){
			this.$emit('update:nominalValuesSelected', this.nominalValuesSelectedLocal)
		},
		emitOrdinalRangeBounds(){
			this.$emit('update:ordinalValueRangeBounds', this.ordinalValueRangeBoundsLocal)
		},
		emitDocValueScaling(){
			this.$emit('update:selectedDocumentScaling', this.selectedDocumentScalingLocal)
		},
		emitNarValueScaling(){
			this.$emit('update:selectedNarrativeScaling', this.selectedNarrativeScalingLocal)
		},
		emitRangeSelctorSliderValues(){
			this.$emit('update:rangeSelectorSliderValues', this.rangeSelectorSliderValuesLocal)
		},
		setMessage(message, type){
			this.alert.message = message
			this.alert.type = type
		},
		clearUp() {
			this.loincTermsSelectedQn = false
			this.loincTermsSelectedNom = false
			this.loincTermsSelectedOrd = false
			this.loincTermsSelectedDoc = false
			this.loincTermsSelectedNar = false
		}
	}

}
</script>

<style>

</style>