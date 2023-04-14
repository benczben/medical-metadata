<template>
  	<div>
	  	<v-autocomplete
			:items="loincParentGroups"
			item-text="parent_group"
			item-key="parent_group_id"
			label="LOINC parent groups"
			v-model="loincParentGroupsSelected"
			multiple
			chips
			return-object
			@change="getLoincGroups"
		>
		</v-autocomplete>
		<v-autocomplete
			:items="loincGroups"
			item-text="group_name"
			item-key="group_id"
			label="LOINC groups"
			v-model="loincGroupsSelected"
			multiple
			chips
			return-object
			@change="getLoincTerms"
		>
		</v-autocomplete>
		<v-autocomplete
			:items="loincTerms"
			:item-text="item => item.long_common_name +' - '+ item.loinc_code"
			item-key="loinc_code"
			label="LOINC terms"
			v-model="loincTermsSelected"
			multiple
			return-object
			chips
			@change="emitLoinc"
		>
	</v-autocomplete>
  </div>
</template>

<script>
import axios from 'axios'
import config from "../../config"

export default {
	name: 'loincCodeSelector',
	props: {
		clear: {
			type: Number
		},
		singleSelect: {
			type: Boolean,
			default: false,
		}
	},
	data() {
		return {
			loincParentGroups: [],
			loincParentGroupsSelected: [],
			loincGroups: [],
			loincGroupsSelected: [],
			loincTerms: [],
			loincTermsSelected: [],
			singleSelectLocal: this.singleSelect,
		}
	},
	watch: {
		clear: {
			handler: function() {
				this.clearUp()
			}
		}
	},
	methods: {
		async getLoincParentGroups() {
			try {
				let response = await axios.get(config.localApi + "/loinc-relevant-parent-groups")
				this.loincParentGroups = response.data
			} catch (error) {
				this.$emit('alert', error)
			}
		},
		async getLoincGroups() {
			try {
				let parentGroupIdList = this.loincParentGroupsSelected.map(selectedParentGorup => selectedParentGorup.parent_group_id)
			
				let response = await axios.get(config.localApi + "/loinc-groups", {
					params: {
					parentGroupIdList: parentGroupIdList,
					},
				})
				this.loincGroups = response.data
				this.getLoincTerms()
			} catch (error) {
				this.$emit('alert', error)
			}
		},	
		async getLoincTerms() {
			try {
				if(this.loincGroupsSelected.length == 0)
					this.loincTermsSelected = []

				let groupIdList = this.loincGroupsSelected.map(group => group.group_id)
				
				let response = await axios.get(config.localApi + "/loinc-terms", {
					params: {
						groupIdList: groupIdList,
					},
				})
				this.loincTerms = response.data
			} catch (error) {
				this.$emit('alert', error)
			}
   		},
		emitLoinc(){
			if(this.singleSelectLocal && this.loincTermsSelected.length > 1) this.loincTermsSelected.shift()
			this.$emit('emitLoincCode', this.loincTermsSelected)
		},
		clearUp() {
			this.loincParentGroupsSelected = []
			this.loincTermsSelected = []
      		this.loincTerms = []
			this.loincGroups = []
			this.loincGroupsSelected = []
		}
	},
	created() {
		this.getLoincParentGroups()
	}
}
</script>

<style>

</style>