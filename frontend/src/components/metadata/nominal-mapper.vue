<template>
	<v-container>
	<v-progress-linear
		indeterminate
		color="cyan"
		v-show="showProgressBar"
	></v-progress-linear>
	<v-dialog
		class="mx-10"
		v-model="dialogNominalMapper"
		fullscreen
		hide-overlay
		transition="dialog-bottom-transition"
	>
	<template v-slot:activator="{ on, attrs }">
	<v-btn
		v-show="nominalMapperSwitch && showCreate"
		class="mx-10"
		color="primary"
		dark
		:v-bind="attrs"
		:v-on="on"
		@click="getNominalColsOfTable"
		style="margin-bottom: 25px" 
		>
		{{txt.openMapper}}
	</v-btn>
	</template>

	<v-card>
		<v-toolbar dark color="secondary">
		<v-toolbar-title>{{txt.editing}} {{selectedDataSourceForNominalMapper}}</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-toolbar-items>
			<v-btn
				dark
				text
				@click="resetNominalMappingVariables()"
			>
				{{txt.saveMapping}}
			</v-btn>
		</v-toolbar-items>
		</v-toolbar>
		<v-list
			three-line
			subheader
		>
		<v-subheader>{{txt.nominalColumns}}</v-subheader>
		<v-list-item v-for="(item, index) in this.nominalColumns" :key="item.column_name">
			<v-list-item-content>
			<v-list-item-title>Column {{index+1}}: {{item.column_name}}</v-list-item-title>
			<v-btn style="max-width:fit-content" @click="getNominalColumnsDistinctValues(item.table_name, item.column_name)">Map {{item.column_name}} </v-btn>
			</v-list-item-content>
		</v-list-item>
		</v-list>
	<v-divider></v-divider>
	<v-row 
		no-gutters 
		v-if="showNominalMapper"
	>
		<v-col cols="12" sm="6" md="6">	
		<v-card class="pa-2" outlined
			tile
		>
			<v-list>
				<v-subheader v-show="nomnialDistinctValues.length > 0"> {{getNominalSubheaderSourceValues()}} </v-subheader>
				<v-list-item
					v-for="(element, index) in nomnialDistinctValues"
					:key="element.aggregate_value"
					dense
				>
				<v-list-item-content>
					<v-list-item-title 
						v-text="element.aggregate_value">
					</v-list-item-title>
					<v-list-item-subtitle>{{index + 1}}</v-list-item-subtitle>

					<v-text-field 
						class="mx-10"
						v-show="nomnialDistinctValues.length > 0"
						v-model="element.aggregate_value"
						disabled
						style="margin-bottom: 25px; margin-top: 30px;"
					></v-text-field> 
					maps to
					<v-autocomplete 
						class="mx-10"
						v-show="nomnialDistinctValues.length > 0"
						:items="nominalValueAutocompleteListForMapping"
						v-model="selectedNominalValueForMapping[index]"
						counter
						label="Pick a value"
						style="margin-bottom: 25px; margin-top: 30px;"
						@change="handleNomnialDistinctValuesMapping(element.aggregate_value, selectedNominalValueForMapping[index])"
					></v-autocomplete> 
				</v-list-item-content>
				</v-list-item>
			</v-list>
			</v-card>
		</v-col>
		<v-col
			cols="6"
			md="6"
		>
			<v-card
			class="pa-2"
			outlined
			tile
			>
			<v-list>
				<v-subheader v-show="nomnialDistinctValues.length > 0">List of existing nominal meta values</v-subheader>
				<v-list-item
					class="mx-10"
					v-for="(element) in nominalValueListForMapping"
					:key="element.nominal_value"
					dense
				>
				<v-list-item-content>
					<v-list-item-title 
					class="mx-10"
					v-text="element.nominal_value">
					</v-list-item-title>
				</v-list-item-content>
				<v-list-item-icon>
					<v-icon
					class="mx-10"
					medium
					color="red darken-2"
					:key="element.nominal_value"
					@click="deleteNominalValueForMapping(element.nominal_value, nomnialDistinctValues[0].loinc_code)">
					mdi-delete
					</v-icon>
				</v-list-item-icon>
				</v-list-item>
				<v-row>
					<v-col>
					<v-text-field
						class="mx-10"
						v-show="nomnialDistinctValues.length > 0"
						v-model="newNominalValueForMapping"
						counter
						hint="New values must be unique"
						label="Type new group"
						style="margin-bottom: 25px; margin-top: 30px;"
					></v-text-field>
					</v-col>
					<v-col>
					<v-btn
						v-show="nomnialDistinctValues.length > 0"
						class="mx-10"
						color="primary"
						dark
						@click="saveNewNominalMappedValue"
						style="margin-bottom: 25px; margin-top: 30px;" 
						>
						Add value
					</v-btn>
					</v-col>
				</v-row>
				<v-row>
					<v-col>
						<v-alert 
							:type="nominalValueAddedType"
							v-show="nominalValueAdded"
						>
							{{nominalValueAddedResponse}}
						</v-alert>
					</v-col>
				</v-row>
			</v-list>
			</v-card>
		</v-col>
		</v-row>
		
	</v-card>
	</v-dialog>
</v-container>
</template>

<script>
import axios from "axios"
import config from "../../config"

export default {
name: "nominalMapper",
props: {
	nominalMapperSwitch:{
		type: Boolean,
		default: false
	},
	showCreate:{
		type: Boolean,
		default: false
	},
	selectedDataSourceForNominalMapper:{
		type: String
	},
},
data: () => ({
	showProgressBar: false,
	txt:{
		saveMapping: "Save Mapping",
		openMapper: "Open Nominal Mapper for Table",
		editing: "Editing",
		nominalColumns: "Nominal Columns",
	},
	nominalColumns: [],
	nominalValueAutocompleteListForMapping: [],
	selectedNominalValueForMapping: [],
	showNominalMapper: false,
	dialogNominalMapper: false,
	newNominalValueForMapping: '',
	nominalValueAdded: false,
	nominalValueAddedResponse: '',
	nominalValueAddedType: 'success',
	nominalMapperObject: {},
	nominalValueListForMapping: [],
	nomnialDistinctValues: [],
}),
methods: {
	async getNominalColsOfTable(){
		// if not data source was selected then no dialog should be shown
		if(this.selectedDataSourceForNominalMapper.length == 0) {
			this.$v.selectedDataSourceForNominalMapper.$touch()
			this.dialogNominalMapper = false
			return
		}
		
		if(this.nominalMapperSwitch){
			try { 
				this.dialogNominalMapper = true
				this.showProgressBar = true
				let res = await axios.get(config.localApi + "/metadata/table-cols-for-scaling", 
				{
					params: {
						scaling: 'nom',
						tablename: this.selectedDataSourceForNominalMapper
					}
				}
				)
				this.nominalColumns = res.data
				this.infoToUser = '' + JSON.stringify(res.data)
				this.showProgressBar = false
			} catch (error) {
				this.infoToUser = '' + error
				this.showProgressBar = false
			}
		}
	},
	resetNominalMappingVariables(){
		this.dialogNominalMapper = false
		this.nomnialDistinctValues = []
		this.nominalValueListForMapping = []
		this.nominalValueAutocompleteListForMapping = []
		this.selectedNominalValueForMapping = []
		this.$emit('saveNominalMapping', this.nominalMapperObject)
	},
	async getNominalColumnsDistinctValues(table, column){
		if(table, column){
		try {   
			this.showProgressBar = true
			let res = await axios.get(config.localApi + "/metadata/distinct-values", 
				{
					params: {
						tablename: table,
						columnname: column
				}
				}
			)
			this.nomnialDistinctValues = res.data
			let resValues = await axios.get(config.localApi + "/metadata/nominal-mapped-value", 
				{
					params:{
						loincCode: this.nomnialDistinctValues[0].loinc_code
					}
				}
			)
			this.nominalValueListForMapping = resValues.data
			this.nominalValueAutocompleteListForMapping = resValues.data.map(x => x.nominal_value)
			await this.handleSelectedNominalValueForMapping()
			this.infoToUser = '' + JSON.stringify(res.data)
			this.showProgressBar = false
			this.showNominalMapper = true
		} catch (error) {
			this.infoToUser = '' + error
			this.showProgressBar = false
			this.showNominalMapper = false
		}
		}
	},
	handleSelectedNominalValueForMapping(){
		// the function loads the selected values into the list if they have been assigned (even partially) by the user before
		let sourceDb = this.nomnialDistinctValues[0].source_database
		let loincCode = this.nomnialDistinctValues[0].loinc_code

		if(this.nominalMapperObject && this.nominalMapperObject[sourceDb] && this.nominalMapperObject[sourceDb][loincCode]){
			for(let value of this.nominalMapperObject[sourceDb][loincCode]){
				for(let [index,valueNomnialDistinctValues] of this.nomnialDistinctValues.entries()){
					if(valueNomnialDistinctValues.aggregate_value == value.aggregateValue){
						this.selectedNominalValueForMapping[index] = value.selectedValue
					}
				}
			}
		}
	},
	getNominalSubheaderSourceValues() {
		if(this.nomnialDistinctValues.length > 0)
		return `Distinct value list from source of ${this.nomnialDistinctValues[0].column_name}`
	},
	async saveNewNominalMappedValue(){
		try{
			await axios.post(config.localApi + "/metadata/nominal-mapped-value", 
				{
					nominalValue: this.newNominalValueForMapping,
					loincCode: this.nomnialDistinctValues[0].loinc_code
				}
			) 
			let res = await axios.get(config.localApi + "/metadata/nominal-mapped-value", 
				{
					params:{
						loincCode: this.nomnialDistinctValues[0].loinc_code
					}
				}
			)
			this.nominalValueListForMapping = res.data
			this.nominalValueAutocompleteListForMapping = res.data.map(x => x.nominal_value)
			this.newNominalValueForMapping = ''	
			this.nominalValueAdded = true
			this.nominalValueAddedResponse = 'Values is added'
			this.nominalValueAddedType = 'success'
		} catch (error) {
			this.nominalValueAdded = true
			this.nominalValueAddedResponse = 'Something went wrong ' + error.message
			this.nominalValueAddedType = 'error'
		}
		setTimeout(() => {
			this.nominalValueAdded = false
			this.nominalValueAddedResponse = ''
		}, 2500);
	},
	async deleteNominalValueForMapping(nominalValue, loincCode){
		try {
			await axios.delete(config.localApi + "/metadata/nominal-mapped-value", 
				{ 
					data: {
						loincCode: loincCode,
						nominalValue: nominalValue
					} 
				}
			)
			let resList = await axios.get(config.localApi + "/metadata/nominal-mapped-value", 
				{
					params:{
						loincCode: loincCode
					}
				}
			)
			this.nominalValueListForMapping = resList.data
			this.nominalValueAutocompleteListForMapping = resList.data.map(x => x.nominal_value)
			this.nominalValueAdded = true
			this.nominalValueAddedResponse = 'Deleted'
			this.nominalValueAddedType = 'success'
		} catch (error) {
			this.nominalValueAdded = true
			this.nominalValueAddedResponse = 'Value could not be deleted ' + error.message
			this.nominalValueAddedType = 'error'
		}
		setTimeout(() => {
			this.nominalValueAdded = false
			this.nominalValueAddedResponse = ''
		}, 2500);
	},
	handleNomnialDistinctValuesMapping(aggregateValue, selectedValue){
		let sourceDb = this.nomnialDistinctValues[0].source_database
		let loincCode = this.nomnialDistinctValues[0].loinc_code
		let leafExists = false

		//create structure if needed
		if(!this.nominalMapperObject[sourceDb])
			this.nominalMapperObject[sourceDb] = {}
		
		if(!this.nominalMapperObject[sourceDb][loincCode])
			this.nominalMapperObject[sourceDb][loincCode] = []
		
		//if leaf exists -> update the value
		if(this.nominalMapperObject[sourceDb][loincCode].length > 0){
			for(let leaf of this.nominalMapperObject[sourceDb][loincCode]){
				if(leaf?.aggregateValue == aggregateValue){
					leaf.selectedValue = selectedValue
					leafExists = true
				}
			}
		} 

		//if leaf does not exist -> create
		if(!leafExists){
			this.nominalMapperObject[sourceDb][loincCode].push({
				aggregateValue: aggregateValue,
				selectedValue: selectedValue
			})
		}
	},
},
mounted:() => {

}
}
</script>

<style>

</style>