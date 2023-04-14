<template>
	<v-range-slider
		v-model="rangeSelectorSliderValuesLocal"
		:min="rangeSelectorMinValue"
		:max="rangeSelectorMaxValue"
		:step="step"
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
				:disabled="disabled"
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
			:disabled="disabled"
			@change="$set(rangeSelectorSliderValuesLocal, 1, $event)"
			></v-text-field>
		</template>
	</v-range-slider>
</template>

<script>
export default {
	name: 'rangeSlider',
	props: {
		rangeSelectorSliderValues: {},
		rangeSelectorMinValue: {
			required: true,
			default: 0,
		},
		rangeSelectorMaxValue: {
			required: true,
			default: 100,
		},
		step: {
			required: false,
			default: 1,
		},
		disabled: {
			required: false,
			default: true,
		},
	},
	data() {
		return{
			rangeSelectorSliderValuesLocal: this.rangeSelectorSliderValues,
		}
	},
	watch: {
		rangeSelectorSliderValuesLocal: {
			handler: function() {
				this.emitRangeSelctorSliderValues()
			}
		},
	},
	methods: {
		emitRangeSelctorSliderValues(){
			this.$emit('update:rangeSelectorSliderValues', this.rangeSelectorSliderValuesLocal)
		},
	}
}
</script>

<style>

</style>