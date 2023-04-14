<template>
	<v-dialog
		class="mx-10"
		v-model="dialog"
		fullscreen
		hide-overlay
		transition="dialog-bottom-transition"
	>
		<v-progress-linear
			indeterminate
			color="cyan"
			v-show="showProgressBar"
		></v-progress-linear>
		<template v-slot:activator="{ on, attrs }">
			<v-btn
				v-show="ordinalAsNominalSwitch && showCreate"
				class="mx-10"
				color="primary"
				dark
				:v-bind="attrs"
				:v-on="on"
				@click="getOrdinalColsOfTable"
				style="margin-bottom: 25px" 
			>
			{{txt.openEditor}}
			</v-btn>
		</template>

		<v-card>
			<v-toolbar
			dark
			color="secondary"
			>
			<v-toolbar-title>{{txt.editing}} {{selectedDataSource}}</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-toolbar-items>
				<v-btn
				dark
				text
				@click="saveOrder"
				>
				{{txt.save}}
				</v-btn>
			</v-toolbar-items>
			</v-toolbar>
			<v-list
			three-line
			subheader
			>
			<v-subheader>{{txt.ordinalColumns}}</v-subheader>
			
			<v-list-item v-for="(item, index) in this.ordinalColumns" :key="item.column_name">
				<v-list-item-content>
				<v-list-item-title>{{txt.column}} {{index+1}}: {{item.column_name}}</v-list-item-title>
				<v-btn style="max-width:fit-content" color="primary" @click="getOrdinalColumnsDistinctValues(item.table_name, item.column_name)">{{txt.edit}} {{item.column_name}} {{txt.order}}</v-btn>
				</v-list-item-content>
			</v-list-item>
			</v-list>
			<v-divider></v-divider>

			<!-- Draggable ordering of values -->
			
			<v-row no-gutters >
				<v-col cols="12" sm="12" md="12">	
					<v-card class="pa-2"  tile v-if="ordinalDistinctValues && ordinalDistinctValues.length > 0">
						<ordinal-mapper-child
							:dialogToOrdinalMapper="dialogToOrdinalMapper"
							:ordinalDistinctValues="ordinalDistinctValues"
							:selectedDataSource="selectedDataSource"
							:ordinalMapperObject="ordinalMapperObject"
							@saveMappedOrdinalOrder="saveMappedOrdinalOrder"
						></ordinal-mapper-child>
					</v-card>
				</v-col>
			</v-row>

		</v-card>
	</v-dialog>
</template>

<script>
import axios from "axios"
import config from "../../config"
import OrdinalMapperChild from './ordinal-mapper-child.vue'

export default {
	name: "ordinalMapper",
	components: { OrdinalMapperChild},
	props: {
		ordinalAsNominalSwitch: {
			type: Boolean,
			default: false
		},
		showCreate: {
			type: Boolean,
			default: false
		},
		selectedDataSource: {
			type: String
		},
	},
	data: () => ({
		txt: {
			openEditor: "Open Order Editor for Table",
			editing: "Editing",
			save: "Close mapper",
			ordinalColumns: "Ordinal Columns",
			column: "Column",
			edit: "Edit",
			order: "order",
			openMapper: "Open Mapper",
		},
		dialog: false,
		dialogToOrdinalMapper: false,
		showProgressBar: false,
		ordinalColumns: [],
		treeViewForCurrentOrder: [],
		ordinalDistinctValues: [],
		tableName: '',
		columName: '',
		ordinalMapperObject: {}
	}),
	methods: {
		async getOrdinalColsOfTable(){
			// if not data source was selected then no dialog should be shown
			if(this.selectedDataSource.length == 0) {
			this.$v.selectedDataSource.$touch()
			this.dialog = false
			return
			}

			if(this.ordinalAsNominalSwitch){
				try { 
					this.dialog = true
					this.showProgressBar = true
					let res = await axios.get(config.localApi + "/metadata/table-cols-for-scaling", 
					{
						params: {
						scaling: 'ord',
						tablename: this.selectedDataSource
						}
					}
					)
					this.ordinalColumns = res.data
					this.infoToUser = '' + JSON.stringify(res.data)
					this.showProgressBar = false
				} catch (error) {
					this.infoToUser = '' + error
					this.showProgressBar = false
				}
			}
		},
		
		async getOrdinalColumnsDistinctValues(table, column){
			if(table, column){
			try {   
				this.tableName = table
				this.columName = column
				this.showProgressBar = true
				let res = await axios.get(config.localApi + "/metadata/distinct-values", 
				{
					params: {
					tablename: table,
					columnname: column
					}
				}
				)
				this.ordinalDistinctValues = res.data
				this.infoToUser = '' + JSON.stringify(res.data)
				this.showProgressBar = false
				this.openMapper()
			} catch (error) {
				this.infoToUser = '' + error
				this.showProgressBar = false
			}
			}
		},
		saveOrder(){
			this.dialog = false
			let objectToEmit = {
				treeView: this.treeViewForCurrentOrder,
				ordinalMapperObject: this.ordinalMapperObject
			}
			this.$emit("treeViewForCurrentOrderChange", objectToEmit)
		},
		handleTreeStructure(object){
			this.treeViewForCurrentOrder = object
		},
		openMapper(){
			this.dialogToOrdinalMapper = true
		},
		saveMappedOrdinalOrder(emittedObject){
			this.dialogToOrdinalMapper = false
			if(emittedObject == 'discard') return
			this.treeViewForCurrentOrder = emittedObject.treeView
		}
	},
	mounted:() => {

	}
}
</script>

<style>
.ghost {
opacity: 0.5;
background: #c8ebfb;
}

</style>