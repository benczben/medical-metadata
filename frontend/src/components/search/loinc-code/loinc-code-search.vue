<template>
	<form>
		<!-- loinc selector as a structure -->
		<loinc-code-selector
			:clear="forceRenderCounter"
			@emitLoincCode="setLoincTermsSelectedBoolean"
		>
		</loinc-code-selector>

		<v-btn 
			v-show="loincTermIsSelected"
			class="mr-4"
			@click="getRelatedCollections"
		>
			collections containing this LOINC
		</v-btn>

		<v-btn @click="clear"> clear </v-btn>

		<result-list
			class="resultList"
			v-show="show.resultList"
			:resultList="collectionList"
		></result-list>
	</form>
</template>

<script>
import axios from 'axios'
import config from '../../../config'
import loincCodeSelector from '../loinc-code-selector.vue'
import resultList from '../search-result/result-list.vue'

export default {
	components: {
		loincCodeSelector,
		resultList,
	},
	name: 'loincCodeSearch',
	props: {
		alert: {
			type: Object
		}
	},
	data(){
		return {
			forceRenderCounter: 0,
			loincTermsSelected: [],
			collectionList: [],
			show: {
				collectionList: false,
				resultList: false,
			},
			collectionListResultEmpty: false,
		}
	},
	computed: {
		loincTermIsSelected() {
			return (this.loincTermsSelected.length > 0) ? true : false
		}
	},
	methods: {
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
		async getRelatedCollections() {
			try {
				let collectionsRes = await axios.get(config.localApi + "/collections-to-loinc", {
					params: {
						loinc_codes: this.loincTermsSelected.map(x => x.loinc_code)
					},
				})
                this.collectionList = collectionsRes.data.map(collection => collection.source_database)
				this.show.resultList = true
			} catch (error) {
               	this.$emit('error', error)
			}
		},
		async clear() {
			this.collectionList = []
			this.forceRenderCounter += 1 
			this.collectionListResultEmpty = false
		},
	},
}
</script>

<style>

.resultList{
	margin-top: 28px;
}

</style>