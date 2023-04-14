<template>
	<v-container>
		<v-row class="text-center">
			<v-col md10>
				<v-alert :type="alert.type" v-show="alert.show">
					{{ alert.message }}
				</v-alert>

				<v-select
					v-model="selectedSeachType"
					:items="searchType"
					item-text="name"
					item-value="key"
					label="Select Search Type"
					persistent-hint
					return-object
					single-line
				></v-select>
				
				<!-- loinc code based search -->
				<div v-show="selectedSeachType.key == 1">
					<loinc-code-seach
						:alert="alert"
						@error="alertError"
					/>
				</div>

				<!-- loinc parts based serach -->
				<div v-show="selectedSeachType.key == 2">
					<loinc-part-value-search
						@error="alertError"
					/>
				</div>

				<!-- compossite colleciton content search -->
				<div v-show="selectedSeachType.key == 3">
					<composite-colelction-descriptor-search
						:showContent="selectedSeachType.key == 3"
						@error="alertError"
					/>
				</div>

				<!-- collection quality based search -->
				<div v-show="selectedSeachType.key == 4">
					<quality-based-search
						:showContent="selectedSeachType.key == 4"
						@error="alertError"
					/>
				</div>

				<!-- loinc code based aggregate value search -->
				<div v-show="selectedSeachType.key == 5">
					<aggregate-content-search
						:showContent="selectedSeachType.key == 5"
						:alert="alert"
						@error="alertError"
					/>
				</div>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import loincCodeSeach from './loinc-code/loinc-code-search.vue'
import loincPartValueSearch from './loinc-part-value/loinc-part-value-seach.vue'
import compositeColelctionDescriptorSearch from './composite-collection-descriptor/compostite-collection-descriptor.vue'
import qualityBasedSearch from './quality-based/quality-based-search.vue'
import aggregateContentSearch from './aggregate-content/aggregate-content-search.vue'

export default {
	components: { 
		loincCodeSeach,
		loincPartValueSearch,
		compositeColelctionDescriptorSearch,
		qualityBasedSearch,
		aggregateContentSearch,
	},
	name: "search",
	data() {
		return {
			alert: {
				message: '',
				show: false,
				type: 'info'
			},
			searchType: [
				{
					name: "LOINC codes as collection content descriptors",
					key: 1,
				},
				{
					name: "LOINC Part Value as a search value",
					key: 2,
				},
				{
					name: "Composite collection descriptor search",
					key: 3,
				},
				{
					name: "Collection quality based search",
					key: 4,
				},
				{
					name: "LOINC code based aggregate value search",
					key: 5,
				},
			],
			selectedSeachType: '',
		}
	},
	methods: {
		alertError(alertMessage){
			this.alert.message = alertMessage,
			this.alert.show = true,
			this.alert.type = 'error'
			setTimeout(() => this.alert.show = false, 7500)
		}
	}
}
</script>

<style scoped>
.resultList {
	padding: 25px;
}
</style>
