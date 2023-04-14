<template>
  	<form>
		<!-- loinc part selection-->
		<p class="loincPartValueInfo">{{txt.info}}</p>
		<v-row no-gutters>
			<v-col
				v-for="part in loincParts"
				:key="part.value"
			>
			{{part.text}}
				<v-autocomplete
					v-model="loincPartSelected[part.value]"
					:items="loincPartValues[part.value]"
					:item-key="part.value"
					:item-text="loincPartValues[part.value].loinc_part_value"
					single
					chips
					return-object
				>
				</v-autocomplete>
			</v-col>
		</v-row>
		<v-btn @click="getCollectionsToLoincPartValues">Search Collections</v-btn>

		<result-list
			:key="renderKey"
			class="resultListLoincPartSearch"
			v-show="collectionList.length > 0"
			:resultList="collectionList"
			:keyToExpand="keyToExpand"
			:expandableContent="loincCodeList"
			:expandableContentHeaders="loincInfoHeader"
			:expandableItemKey="expandableItemKey"
			@clickedRow="getCollectionDetails"
		></result-list>
	</form>
</template>

<script>
import axios from 'axios'
import config from '../../../config'
import resultList from '../search-result/result-list-as-table.vue'

export default {
	name: 'loincPartValueSearch',
	components: {
		resultList,
	},
	data() {
		return{
			renderKey: 0,
			keyToExpand: '',
			loincPartSelected: [],
			loincPartValueSelected: [],
			loincParts: [
				{ text: 'Component', value: '1'},
				{ text: 'Property', value: '2'},
				{ text: 'Time aspect', value: '3'},
				{ text: 'System', value: '4'},
				{ text: 'Scale', value: '5'},
				{ text: 'Method', value: '6'},
			],
			loincPartValues: [],
			txt: {
				info: 'Search for a specific LOINC part value or a combination of different LOINC Part values'
			},
			collectionList: [],
			loincCodeList: [],
			loincInfoHeader: [
				{name: 'Loinc code', value: 'loinc_code'},
				{name: 'Long common name', value: 'long_common_name'}
			],
			expandableItemKey: '',
		}
	},
	methods: {
		async getLoincPartValues(loincPart){
			try {
				let loincPartValues = await axios.get(config.localApi + '/loinc-part-value', {
					params: {
						component: loincPart.text,
						loincPartSerialNumber:loincPart.value
					}
				})
                this.loincPartValues[loincPart.value] = loincPartValues.data
			} catch (error) {
				let errormessage = 'Loinc Part Values could not be loaded for further selection'
				this.$emit('error', errormessage)
			}
		},
		async loadThem(){
			for(let part of this.loincParts){
				await this.getLoincPartValues(part)
			}
		},
		async getCollectionsToLoincPartValues() {
			try {
				this.loincCodeList = []
				this.expandableContentLocal = []
				this.expandableItemKey = ''
				this.renderKey += 1
				let collections = await axios.get(config.localApi + '/collection-to-loinc-part-value' , {
					params: {
						component: this.loincPartSelected[1],
						property: this.loincPartSelected[2],
						time_aspect: this.loincPartSelected[3],
						system: this.loincPartSelected[4],
						scale: this.loincPartSelected[5],
						method: this.loincPartSelected[6],
					}
				})
				this.collectionList = collections.data
				if(collections.data.length == 0) throw new Error('empty')
			} catch (error) {
                let errormessage = 'Error at the search for a collection'
				if(error.message == 'empty') {
					errormessage = 'Empty result set. No collection fulfills the search.'
				}
				this.$emit('error', errormessage)
			}
		},
		async getCollectionDetails(collection){
			try {
				let loincCodesToCollection = await axios.get(config.localApi + '/loinc-codes-to-part-values', {
					params: {
						component: this.loincPartSelected[1],
						property: this.loincPartSelected[2],
						time_aspect: this.loincPartSelected[3],
						system: this.loincPartSelected[4],
						scale: this.loincPartSelected[5],
						method: this.loincPartSelected[6],
						collection: collection
					}
				})
				this.loincCodeList = loincCodesToCollection.data
				this.keyToExpand = collection
				this.renderKey += 1
				this.expandableItemKey = 'loinc_code'
				if(this.loincCodeList.length == 0) throw new Error('empty')
			} catch (error) {
                let errormessage = 'Error at the search for codes, which desribe the localtion and fulfill the search paramteres.'
				if(error.message == 'empty') {
					errormessage = 'Empty result set.'
				}
				this.$emit('error', errormessage)
			}
		},
	},
	created(){
		// this is a rendering issue override
		for(let i = 1; i < 7; i++){
			this.loincPartValues[i] = new Array
			this.loincPartValues[i][0] = {'loinc_part_value': 'placeholder'}
		}
		this.loadThem()
	}
}
</script>

<style>
.loincPartValueInfo{
	padding-top: 25px;
	padding-bottom: 35px;
}

.resultListLoincPartSearch{
	padding-top: 38px;
}
</style>