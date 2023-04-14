<template>
<v-container>
<v-row class="text-center">
	<v-col md10>
		<v-btn class="mr-4" @click="createMetadataAggregationTable">
			{{txt.btn.create}}
		</v-btn>
		<v-btn class="mr-4" @click="importMetadataModel">
			{{txt.btn.import}}
		</v-btn>
		<v-btn class="mr-4" @click="setDeleteMetadataAggregation">
			{{txt.btn.delete}}
		</v-btn>
		<v-btn class="mr-4" @click="createCompositeContentDescriptos">
			{{txt.btn.createCompositeDescriptor}}
		</v-btn>
	</v-col>
</v-row>
<v-row>
	<v-col>
	<form>
		<!-- Collection selector -->
		<collection-selector
			:show="show.create || show.delete"
			:label="(show.create) ? 'Collection to which a meta model should be created' : 'Delete the selected colledions\'s meta data'"
			@info="appendInfoToInfoBox"
			@collectionChanged="updateSelectedCollection"
		/>
	
		<v-col>
			<v-row>
				<v-spacer></v-spacer>
			</v-row>
		</v-col>

		<!-- Quantitative scaling -->
			<v-card
				class="mx-auto"
				outlined
				v-show="show.create"
				color="#D7D7D7"
			>
			<v-list-item three-line>
				<v-list-item-content>
					<div class="overline mb-4">
						Quantitative Value Settings
					</div>
				</v-list-item-content>
			</v-list-item>
		
			<v-select
				class="mx-10"
				v-model="accuracySupportSelected"
				:items="accuracySupport"
				label="Desired accuracy of the metadata model's ordinal values"
				v-show="show.create"
			/>
			</v-card>

		<v-col>
			<v-row>
				<v-spacer></v-spacer>
			</v-row>
		</v-col>

		<!-- Nominal scaling -->
			<v-card
				class="mx-auto"
				outlined
				v-show="show.create"
				color="#D7D7D7"
			>
				<v-list-item three-line>
					<v-list-item-content>
					<div class="overline mb-4">
						Nominal Value Settings
					</div>
					<v-list-item-title>The meta model supports mapping of source values to a unified model, created exclusively for the meta model.</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			
				<v-switch
					class="mx-10"
					v-model="nominalMapperSwitch"
					:label="`Nomnial values needs to be mapped`"
					v-show="show.create"
					@change="getGeneratedTables"
				/>
				
				<!-- nominal mapper dialog -->
				<nominal-mapper
					:nominalMapperSwitch="nominalMapperSwitch"
					:showCreate="show.create"
					:selectedDataSourceForNominalMapper="collectionSelectedToPass"
					@saveNominalMapping="saveNominalMapping"
				/>
			</v-card>

		<v-col>
			<v-row>
				<v-spacer></v-spacer>
			</v-row>
		</v-col>

		<!-- ordinal values -->
		<v-card
			class="mx-auto"
			outlined
			v-show="show.create"
			color="#D7D7D7"
		>
			<v-list-item v-show="show.create" three-line>
				<v-list-item-content>
					<div class="overline mb-4">
						Ordinal Value Settings
					</div>
					<v-list-item-title>Ordinal values are offeing two options.<br> They can be handled as distinct nominal values. Or they can be mapped to a pre-defined model and handled as ordinal values.</v-list-item-title>
				</v-list-item-content>
			</v-list-item>

			<v-switch
				class="mx-10"
				v-model="ordinalAsNominalSwitch"
				:label="`Handle ordinal different than nominal`"
				v-show="show.create"
				@change="getGeneratedTables"
			/>
			<div>
				<!-- Ordinal mapper dialog -->
				<ordinal-mapper
					:ordinalAsNominalSwitch="ordinalAsNominalSwitch"
					:showCreate="show.create"
					:selectedDataSource="collectionSelectedToPass"
					@treeViewForCurrentOrderChange="treeViewForCurrentOrderChange"
				/>
				<v-treeview 
					class="mx-10"
					:items="treeViewForCurrentOrder"
				/>
			</div>        
		</v-card>

		<v-col>
			<v-row>
				<v-spacer></v-spacer>
			</v-row>
		</v-col>
		
		<!-- Document sclaing -->
		<v-card
			class="mx-auto"
			outlined
			v-show="show.create"
			color="#D7D7D7"
		>
			<v-list-item three-line>
				<v-list-item-content>
					<div class="overline mb-4">Document Value Settings</div>
					<v-list-item-title>The meta model supports document scaled values as boolean</v-list-item-title>
					<v-list-item-subtitle>This is a cheap operation</v-list-item-subtitle>
				</v-list-item-content>
			</v-list-item>
			<v-switch
				class="mx-10"
				v-model="includeDocumentValues"
				:label="`Include values with doc sclaing`"
				v-show="show.create"
			/>
		</v-card>

		<v-col>
			<v-row>
				<v-spacer></v-spacer>
			</v-row>
		</v-col>
		
		<!-- Narrative sclaing -->
		<v-card
			class="mx-auto"
			outlined
			v-show="show.create"
			color="#D7D7D7"
		>
			<v-list-item three-line>
				<v-list-item-content>
					<div class="overline mb-4">	Narrative Value Settings </div>
					<v-list-item-title>The meta model supports narrative scaled values as boolean</v-list-item-title>
					<v-list-item-subtitle>This is a cheap operation</v-list-item-subtitle>
				</v-list-item-content>
			</v-list-item>
			<v-switch
				class="mx-10"
				v-model="includeNarrativeValues"
				:label="`Include values with nar sclaing`"
				v-show="show.create"
			/>
		</v-card>
		
		<br />
		<v-btn @click="submitCreateMetadataAggregation" v-show="show.create"> {{txt.btn.submit}} </v-btn>
		<v-btn @click="exportMetadataModel" v-show="show.create" class="metaExportButton"> {{txt.btn.export}} </v-btn>
		<v-btn @click="deleteMetadataAggregation" v-show="show.delete"> {{txt.btn.submit}} </v-btn>
	</form>
	</v-col>
	</v-row>

	<!-- composite content descriptor -->
	<composite-content-descriptor
		:showContent="show.compositeContentDescriptor"
		@success="handleCompositeContentResponse"
		@error="handleCompositeContentResponse"
	/>

	<!-- import metadata model -->
	<import-metadata-model
		:show="show.import"
	/>
	
	<br />

	<v-progress-linear
		indeterminate
		color="cyan"
		v-show="showProgressBar"
	/>
	
	<br />

	<v-row class="text-center">
		<v-col md10>
			<v-textarea
				name="input-7-1"
				label="Infobox"
				:value="infoToUser"
				background-color="#efefef"
				disabled
			></v-textarea>
		</v-col>
	</v-row>
</v-container>
</template>

<script>
import axios from "axios"
import FileSaver from "file-saver"
import config from "../../config"
import { validationMixin } from "vuelidate"
import NominalMapper from './nominal-mapper.vue'
import OrdinalMapper from './ordinal-mapper.vue'
import CompositeContentDescriptor from './composite-content-descriptor.vue'
import CollectionSelector from './collection-selector.vue'
import ImportMetadataModel from './metadata-import.vue'

export default {
	name: "metadatamanager",
	components: {
		NominalMapper,
		OrdinalMapper,
		CompositeContentDescriptor,
		CollectionSelector,
		ImportMetadataModel,
	},  
	mixins: [validationMixin],
	data: () => ({
		infoToUser: [],
		showProgressBar: false,
		txt: {
			btn: {
				delete: 'Delete Metadata Model',
				create: 'Create Metadata Model',
				createCompositeDescriptor: 'Create Composite Content Descriptors',
				submit: 'Submit',
				export: 'Export Metadata',
				import: 'Import Metadata',
			}
		},
		accuracySupport: ['high', 'medium', 'low'],
		accuracySupportSelected: 'high',
		ordinalAsNominalSwitch: false,
		generatedTableNames: [],
		generatedTableNamesForNominal: [],
		treeViewForCurrentOrder:[],
		includeDocumentValues: true,
		includeNarrativeValues: true,
		nominalMapperSwitch: false,
		nominalMapperObject: {},
		ordinalMapperObject: {},
		show: {
			compositeContentDescriptor: false,
			create: false,
			delete: false,
			import: false,
		},
		collectionSelected: '',
	}),
	computed:{
		collectionSelectedToPass(){
			if(this.collectionSelected && this.collectionSelected.text){
				return this.collectionSelected.text
			} else {
				return ''
			}
		},
	},
	methods: {
		async createMetadataAggregationTable(){
			this.show.create = !this.show.create
			this.show.compositeContentDescriptor = false
			this.show.delete = false
		},
		async setDeleteMetadataAggregation(){
			this.show.create = false
			this.show.compositeContentDescriptor = false
			this.show.delete = !this.show.delete
			
		},
		async deleteMetadataAggregation(){
			try {
				this.showProgressBar = true
				let res = await axios.delete(config.localApi + "/metadata/metadimension", {
					data: {
						collectionName: this.collectionSelectedToPass
					}
				})
				this.infoToUser = res.data
				this.showProgressBar = false;     
			} catch (error) {
				this.infoToUser = '' + error.response.data.message
				this.showProgressBar = false
			}
		},
		async submitCreateMetadataAggregation(){
			try {   
				this.showProgressBar = true
				let res = await axios.put(config.localApi + "/metadata/metadimension", 
					{ 
						accuracySupport: this.accuracySupportSelected,
						ordinalAsNominal: this.ordinalAsNominalSwitch,
						nominalMappingConsidered: this.nominalMapperSwitch,
						nominalMappingObject: this.nominalMapperObject,
						ordinalOrderTreeview: this.treeViewForCurrentOrder,
						ordinalMapperObject: this.ordinalMapperObject,
						documentSupport: this.includeDocumentValues,
						narrativeSupport: this.includeNarrativeValues,
						collectionName: this.collectionSelectedToPass,
					}
				)
				this.infoToUser = '' + res.data
				this.showProgressBar = false
			} catch (error) {
				this.infoToUser = '' + error.response.data.message
				this.showProgressBar = false
			}
		},
		async exportMetadataModel(){
			try {   
				this.showProgressBar = true
				let res = await axios({
					url: config.localApi + "/metadata/export", 
					method: "post",
					responseType: "blob",
					data: {
						accuracySupport: this.accuracySupportSelected,
						ordinalAsNominal: this.ordinalAsNominalSwitch,
						nominalMappingConsidered: this.nominalMapperSwitch,
						nominalMappingObject: this.nominalMapperObject,
						ordinalOrderTreeview: this.treeViewForCurrentOrder,
						ordinalMapperObject: this.ordinalMapperObject,
						documentSupport: this.includeDocumentValues,
						narrativeSupport: this.includeNarrativeValues,
						collectionName: this.collectionSelectedToPass,
					}
				})
				
				FileSaver.saveAs(new Blob([res.data]), `metadata_${this.collectionSelectedToPass}.json`)

				this.infoToUser = '' + res.data
				this.showProgressBar = false
			} catch (error) {
				this.infoToUser = '' + error
				this.showProgressBar = false
			}
		},
		async importMetadataModel(){
			this.show.import = !this.show.import	
		},
		async getGeneratedTables(){
			if(this.ordinalAsNominalSwitch){
			try {   
				this.showProgressBar = true
				let res = await axios.get(config.localApi + "/metadata/collection-list")
				this.generatedTableNames = res.data.map(obj => obj.tablename)
				this.infoToUser = 'Select a table from the list'
				this.showProgressBar = false
			} catch (error) {
				this.infoToUser = '' + error
				this.showProgressBar = false
			}
			}
			if(this.nominalMapperSwitch){
			try {   
				this.showProgressBar = true
				let res = await axios.get(config.localApi + "/metadata/collection-list")
				this.generatedTableNamesForNominal = res.data.map(obj => obj.tablename)
				this.infoToUser = 'Select a table from the list'
				this.showProgressBar = false
			} catch (error) {
				this.infoToUser = '' + error
				this.showProgressBar = false
			}
			}
		},
		saveNominalMapping(objectValue){
			this.nominalMapperObject = objectValue
		},
		treeViewForCurrentOrderChange(value){
			this.treeViewForCurrentOrder = value.treeView
			this.ordinalMapperObject = value.ordinalMapperObject
		},
		createCompositeContentDescriptos(){
			this.show.create = false
			this.show.compositeContentDescriptor = !this.show.compositeContentDescriptor
			this.show.delete = false
		},
		handleCompositeContentResponse(value){
			this.infoToUser = value
			if(value == 'Error: Request failed with status code 409')
				this.infoToUser = 'The composite key already exists'
		},	
		appendInfoToInfoBox(info){
			this.infoToUser += info
		},
		updateSelectedCollection(collection){
			this.collectionSelected = collection
		},
	},
}
</script>

<style scoped>
.metaExportButton{
	margin-left: 28px;
}

</style>