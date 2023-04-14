<template>
	<div v-show="showContent">
		<form>
			<h5 v-show="submitDisabled">Composite content descriptor's name the participating LOINC code(s) are required fields.</h5>
			<v-text-field
				v-model="compositeContentDescriptorName"
				label="Composite content descriptor's name"
			></v-text-field>
			<v-text-field
				v-model="compositeContentDescriptorDescription"
				label="Description to the content descriptor - will be displayed at search as help text"
			></v-text-field>
			<v-autocomplete
				:items="loincCodes"
				:item-text="item => item.long_common_name +' - LOINC code: '+ item.loinc_code"
				item-key="loinc_code"
				label="Select LOINC code(s) which should be part of the composite content descriptor"
				v-model="selectedLoincCodes"
				multiple
				return-object
				chips
				required
			/>
			<v-autocomplete
				:items="codeOperators"
				item-text="code_operator"
				item-key="code_operator"
				label="Composite descriptor operator - which selected LOINC codes must satisfy the query at the later search"
				v-model="selectedCodeOperator"
				:multiple="false"
				return-object
				chips
				required
			/>
			<v-data-table
				:key="localKey"
				class="tableFormatting"
				v-model="selectedDescriptorsFromTable"
				v-show="show.compositeDescriptors"
				dense
				show-select
				:headers="headers"
				:items="compositeContentDescriptorsList"
				:items-per-page="1000"
				hide-default-footer
			></v-data-table>
			<v-btn 
				@click="submitCompositeDescriptor()"
				:disabled="submitDisabled"
			>
				{{txt.submit}}
			</v-btn>
			<v-btn 
				class="buttonFormatting"
				@click="getCompositeContentDescriptors()"
			>
				{{txt.getCompositeContentDescriptors}}
			</v-btn>
			<v-btn 
				class="buttonFormatting"
				v-show="selectedDescriptorsFromTable.length > 0"
				@click="deleteCompositeContentDescriptors()"
			>
				{{txt.delete}}
			</v-btn>
		</form>
	</div>
</template>

<script>
import axios from 'axios'
import config from "../../config"

export default {
	name: 'compositeContentDescriptor',
	props: {
		showContent: {
			type: Boolean,
			required: true
		}
	},
	data(){
		return{
			localKey: 0,
			txt: {
				submit: 'Submit',
				getCompositeContentDescriptors: 'Get Exsiting Composite Keys',
				delete: 'Delete Selected',
			},
			compositeContentDescriptorName: '',
			compositeContentDescriptorDescription: '',
			loincCodes: [],
			selectedLoincCodes: [],
			headers: [
				{
					text: 'Name',
					value: 'descriptor_name',		
				},
				{
					text: 'Description',
					value: 'description',		
				},
				{
					text: 'Codes',
					value: 'participating_codes',		
				}
			],
			compositeContentDescriptorsList: [],
			show: {
				compositeDescriptors: false
			},
			selectedDescriptorsFromTable: [],
			codeOperators: [],
			selectedCodeOperator: '',
		}
	},
	methods: {
		async getLoincCodesAndLongCommonNames() {
			try {
				let loincCodesRes = await axios.get(config.localApi + "/metalevel-loinc-codes")
				this.loincCodes = loincCodesRes.data
				this.localKey += 1
			} catch (error) {
				this.$emit('error', error)
			}
		},
		async getLoincCodeOperators() {
			try {
				let codeOperatorsRes = await axios.get(config.localApi + "/loinc-code-operators")
				this.codeOperators = codeOperatorsRes.data
				this.localKey += 1
			} catch (error) {
				this.$emit('error', error)
			}
		},
		async submitCompositeDescriptor() {
			try {
				let loincCodesRes = await axios.post(config.localApi + "/composite-content-descriptor", {
					compositeContentDescriptorName: this.compositeContentDescriptorName,
					compositeContentDescriptorDescription: this.compositeContentDescriptorDescription,
					participatingLoincCodes: this.selectedLoincCodes,
					operator: this.selectedCodeOperator.code_operator
				})
				this.$emit('success', `Composite key successfully created. Inserted rows: ${loincCodesRes.data.insertedRowCount}`)	
			} catch (error) {
				this.$emit('error', error)
			}
		},
		async getCompositeContentDescriptors() {
			try {
				let loincCodesRes = await axios.get(config.localApi + "/composite-content-descriptor")
				this.compositeContentDescriptorsList = loincCodesRes.data
				this.show.compositeDescriptors = true
				this.$emit('success', `Loaded.`)	
			} catch (error) {
				this.$emit('error', error)
			}
		},
		async deleteCompositeContentDescriptors() {
			try {
				let ids = this.selectedDescriptorsFromTable.map(code => code.id)
				await axios.delete(config.localApi + "/composite-content-descriptor", { 
					data: {
						idList: ids
					} 
				})
                
				this.$emit('success', 'Deleted.')
				this.selectedDescriptorsFromTable = []
				await this.getCompositeContentDescriptors()
			} catch (error) {
				this.$emit('error', error)
			}
		},
	},
	computed: {
		submitDisabled(){
			if(this.compositeContentDescriptorName == '' || this.selectedLoincCodes.length == 0 || this.selectedCodeOperator == null || this.selectedCodeOperator == '') return true
			else return false
		}
	},
	created: function () {
		this.getLoincCodesAndLongCommonNames()
		this.getLoincCodeOperators()
	}
}
</script>

<style>
.buttonFormatting{
	margin-left: 24px;
}

.tableFormatting{
	margin: 35px;
}
</style>