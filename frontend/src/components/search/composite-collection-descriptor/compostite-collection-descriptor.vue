<template>
	<div v-show="showContent">
		<v-autocomplete
			:items="compositeContentDescriptorsList"
			:item-text="item => item.descriptor_name"
			item-key="id"
			label="Select a composite content descriptor"
			v-model="selectedContentDescriptors"
			:multiple="false"
			return-object
			chips
			required
		/>
		
		<v-card v-show="showCard">
			<v-card-title>{{selectedContentDescriptors.descriptor_name}}</v-card-title>
		
			<v-card-text>
				<strong>{{selectedContentDescriptors.description}}</strong>
				<v-divider></v-divider>
				LOINC codes included in search: 
				<div v-for="item in this.selectedContentDescriptors.participating_codes" :key="item.participating_codes">
					<strong>{{item}}</strong>
				</div>
				<v-divider></v-divider>
				Search method applied to LOINC codes while searching for collection:
				<strong>{{selectedContentDescriptors.code_operator}}</strong>
				<br>
				(ALL: every listed LOINC code must be contained in the collection; 
				<br> ANY: any of the listed LOINC codes must be contained in the collection)
			</v-card-text>
		
			<v-card-actions>
				<v-btn
					color="green lighten-2"
					text
					@click="searchCollections"
				>
				Search Collections
				</v-btn>
			</v-card-actions>
		</v-card>
		
		<!-- result list  -->
		<result-list
			v-show="resultList.length > 0"
			class="resultlistClass"
			:resultList="resultList"
		/>
	</div>
</template>

<script>
import axios from 'axios'
import config from "../../../config"
import resultList from "../search-result/result-list.vue"

export default {
	name: 'compositeColelctionDescriptorSearch',
	components: {
		resultList
	},
	props: {
		showContent:{
			type: Boolean,
			required: true
		}
	},
	data(){
		return {
			compositeContentDescriptorsList: [],
			selectedContentDescriptors: '',
			resultList: [],
		}
	},
	computed: {
		showCard(){
			if(this.selectedContentDescriptors != '') return true
			else return false
		}
	},
	methods: {
		async getCompositeCollectionDescriptors() {
			try {
				let loincCodesRes = await axios.get(config.localApi + "/composite-content-descriptor")
				this.compositeContentDescriptorsList = loincCodesRes.data
			} catch (error) {
				this.$emit('error', error)
			}
		},
		async searchCollections() {
			try {
				let loincCodesRes = await axios.get(config.localApi + "/collections-to-composite-descriptors", {
					params: {
						operator: this.selectedContentDescriptors.code_operator,
						participatingCodes: this.selectedContentDescriptors.participating_codes
					}
				})
				this.resultList = loincCodesRes.data.map(res => res.collection_name)
			} catch (error) {
				this.$emit('error', error)
			}
		}
	},
	created: function () {
		this.getCompositeCollectionDescriptors()
	},
}
</script>

<style>
.resultlistClass{
	margin-top: 35px;
}
</style>