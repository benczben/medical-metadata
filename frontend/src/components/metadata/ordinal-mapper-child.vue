<template>
	<v-dialog
			class="mx-10"
			v-model="dialogToOrdinalMapper"
			fullscreen
			hide-overlay
			transition="dialog-bottom-transition"
		>
  		<v-card>
			<v-toolbar dark color="secondary">
			<v-toolbar-title>Mapping values of: {{selectedDataSource}}, column: {{ordinalDistinctValues[0].column_name}}</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-toolbar-items>
				<v-btn
					text
					color="green"
					@click="resetVariables('save')"
				>
					{{txt.saveMapping}}
				</v-btn>
				<v-btn
					text
					color="red"
					@click="resetVariables('discard')"
				>
					{{txt.discardMapping}}
				</v-btn>
			</v-toolbar-items>
			</v-toolbar>
			<v-row no-gutters >
				<v-col cols="12" sm="6" md="6">	
					<v-card class="pa-2" outlinedtile>
						<ordinal-mapper-valuesetter
							:ordinalDistinctValues="ordinalDistinctValues"
							:ordinalMappingValueSetValues="ordinalMappingValueSetValues"
							:ordinalMapperObject="ordinalMapperObject"
							@ordinalMapperObject="handleOrdinalMapperObject"
						>
						</ordinal-mapper-valuesetter>
					</v-card>
				</v-col>
				<v-col cols="6" md="6">
					<v-card class="pa-2" outlined tile>
						<ordinal-mapper-valuehandler
							:ordinalDistinctValues="ordinalDistinctValues"
							@ordinalMappingValueSetValues="setOrdinalMappingValueSetValues"
						></ordinal-mapper-valuehandler>
					</v-card>
				</v-col>
			</v-row>
		</v-card>
	</v-dialog>	
</template>

<script>
import OrdinalMapperValuesetter from './ordinal-mapper-valuesetter.vue'
import OrdinalMapperValuehandler from './ordinal-mapper-valuehandler.vue'

export default {
	name: "ordinalMapperChild",
  	components: { OrdinalMapperValuesetter, OrdinalMapperValuehandler },
	props: {
    	dialogToOrdinalMapper: {
			type: Boolean,
			default: false
		},
		ordinalDistinctValues: {
			type: Array
		},
		selectedDataSource: {
			type: String
		},
		ordinalMapperObject: {
			type: Object
		}
	},
	data: () => ({
		txt: {
			saveMapping: "Save Mapping",
			ordinalColumns: "Ordinal Columns",
			discardMapping: "Discard"
		},
		ordinalMappingValueSetValues: [],
		treeViewForCurrentOrder: [],
		bufferTillSaveOrDiscard: {},
	}),
	methods: {
		resetVariables(value){
			if (value && value == 'discard') {
				this.$emit('saveMappedOrdinalOrder', 'discard')
			}
			if (value && value == 'save') {
				this.handleTreeStructure(this.bufferTillSaveOrDiscard)
				let emitobject = {
					dialogToOrdinalMapper: this.dialogToOrdinalMapper,
					treeView: this.treeViewForCurrentOrder
				}
				this.$emit('saveMappedOrdinalOrder', emitobject)
			}
		},
		setOrdinalMappingValueSetValues(ordinalMappingValueSetValues){
			this.ordinalMappingValueSetValues = ordinalMappingValueSetValues
		},
		handleOrdinalMapperObject(ordinalMapperObject){
			this.bufferTillSaveOrDiscard = ordinalMapperObject
		},
		handleTreeStructure(currentChangedOrder){
			let sourceDatabase = this.selectedDataSource
			let sourceColumn = ''

			for (const [key] of Object.entries(currentChangedOrder[sourceDatabase])) {
				sourceColumn = key

				if(currentChangedOrder && currentChangedOrder[sourceDatabase] && currentChangedOrder[sourceDatabase][sourceColumn]){
					// check if DB was handled already, if not, then create
					let consideredDataBaseInTreeBoolean = this.treeViewForCurrentOrder.map(levelOne => levelOne.id).includes(sourceDatabase)
					if(!consideredDataBaseInTreeBoolean){
						this.treeViewForCurrentOrder.push({
							id: sourceDatabase,
							name: sourceDatabase,
							children: []
						})
					}

					// check if the table was handled already, if not, then create
					let consideredColumnInTreeBoolean
					for (let valueOne of Object.values(this.treeViewForCurrentOrder)){
						if(valueOne.id == sourceDatabase){
							consideredColumnInTreeBoolean = valueOne.children.map(levelTwo => levelTwo.id).includes(sourceColumn)
							if(!consideredColumnInTreeBoolean){
							valueOne.children.push({
								id: sourceColumn,
								name: sourceColumn,
								children: []
							})
							}
						}
					}

					// construct the leaf nodes for the treee structure
					for (let valueOne of Object.values(this.treeViewForCurrentOrder)){
						if(valueOne.id == sourceDatabase){
							for (let valueTwo of Object.values(valueOne.children)){
								if(valueTwo.id == sourceColumn){
									let constructedLeafNode = []
									for(let i of currentChangedOrder[valueOne.id][valueTwo.id]){
										constructedLeafNode.push({
										id: i.aggregateValue,
										name: i.selectedValue
										})
									}
									valueTwo.children = constructedLeafNode
								}
							}
						}
					}
				}
			}
		}
	}
}
</script>

<style>

</style>