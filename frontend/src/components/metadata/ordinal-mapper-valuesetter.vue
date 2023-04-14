<template>
    <v-list>
		<v-subheader v-show="true > 0"> {{txt.subheader}} </v-subheader>
		<v-list-item
			v-for="(element, index) in ordinalDistinctValues"
			:key="element.aggregate_value"
			dense
			class="listItem"
		>
		<v-list-item-content
			class="listItemContent">
			<v-list-item-title 
				v-text="'Value ' + element.aggregate_value">
			</v-list-item-title>
			<v-text-field 
				class="textField mx-10"
				v-show="ordinalDistinctValues.length > 0"
				v-model="element.aggregate_value"
				disabled
			></v-text-field> 
			maps to
			<v-autocomplete 
				class="textField mx-10"
				v-show="ordinalDistinctValues.length > 0"
				:items="ordinalMappingValueSetValues"
				v-model="selectedOrdinalValueForMapping[index]"
				@change="handleOrdinalDistinctValuesMapping(element.aggregate_value, selectedOrdinalValueForMapping[index])"
				counter
				label="Pick a value"
			></v-autocomplete> 
		</v-list-item-content>
		</v-list-item>
	</v-list>
</template>

<script>

export default {
    name: "OrdinalMapperValuesetter",
    props: {
		ordinalDistinctValues: {
			type: Array
		},
		ordinalMappingValueSetValues: {
			type: Array
		},
		ordinalMapperObject: {
			type: Object
		}
    },
    data: () => ({
		txt: {
			subheader: "List of distinct values"
		},
		selectedOrdinalValueForMapping: [],
    }),
    methods: {
		handleOrdinalDistinctValuesMapping(aggregateValue, selectedValue){
			let sourceDb = this.ordinalDistinctValues[0].source_database
			let loincCode = this.ordinalDistinctValues[0].loinc_code
			let leafExists = false 

			//create structure if needed
			if(!this.ordinalMapperObject[sourceDb])
				this.ordinalMapperObject[sourceDb] = {}
			
			if(!this.ordinalMapperObject[sourceDb][loincCode])
				this.ordinalMapperObject[sourceDb][loincCode] = []
			
			//if leaf exists -> update the value
			if(this.ordinalMapperObject[sourceDb][loincCode].length > 0){
				for(let leaf of this.ordinalMapperObject[sourceDb][loincCode]){
					if(leaf?.aggregateValue == aggregateValue){
						leaf.selectedValue = selectedValue
						leafExists = true
					}
				}
			}

			//if leaf does not exist -> create
			if(!leafExists){
				this.ordinalMapperObject[sourceDb][loincCode].push({
					aggregateValue: aggregateValue,
					selectedValue: selectedValue
				})
			}
			this.$emit('ordinalMapperObject', this.ordinalMapperObject)
		},
    }
}
</script>

<style scoped>
.listItemContent{
	padding-top: 0px;
	padding-bottom: 0px;
	margin-bottom: 0px;
	margin-top: 0px;
}
.listItem{
	padding-top: 0px;
	padding-bottom: 0px;
	margin-bottom: 0px;
	margin-top: 0px;
}
.textField{
	padding-top: 0px;
	padding-bottom: 0px;
	margin-bottom: 0px;
	margin-top: 0px;
}
</style>