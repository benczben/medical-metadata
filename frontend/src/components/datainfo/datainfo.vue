<template>
	<v-container>
		<v-row class="text-center">
			<v-col md10>
				<v-btn class="mr-4" @click="getTables">
					{{txt.btn.get}}
				</v-btn>
				<v-btn class="mr-4" @click="createDataset">
					{{txt.btn.create}}
				</v-btn>
				<v-btn class="mr-4" @click="uploadCollection">
					{{txt.btn.upload}}
				</v-btn>
				<v-btn class="mr-4" @click="deleteCollection">
					{{txt.btn.deleteCollection}}
				</v-btn>
				<v-btn class="mr-4" @click="deleteAllDatasets">
					{{txt.btn.delete}}
				</v-btn>
			</v-col>
		</v-row>
		<v-row>
			<v-col md="12">
				<create-dataset
					:show="show.create"
					@infoToUserUpdate="setInfoToUser"
					@progress="setProgressBar"
				/>
			</v-col>
		</v-row>
		<v-row>
			<v-col md="12">
				<upload-collection
					:show="show.upload"
				/>
			</v-col>
		</v-row>
		<v-row>
			<v-col md="12">
				<v-card class="mx-auto my-12" v-show="show.deleteCollection">
					<v-card-title>Delete a collection</v-card-title>
					<div class="deleteCollection">
						<collection-selector
							:triggerLoading="renderKey"
							:show="show.deleteCollection"
							:label="'Delete the selected colledion and every corresponding data'"
							@info="setInfoToUser"
							@collectionChanged="updateSelectedCollection"
						/>
					</div>
					<v-btn @click="deleteTheCollection" :disabled="!this.collectionSelected.text" class="deleteCollectionButton">{{txt.btn.deleteTheCollection}}</v-btn>
				</v-card>
			</v-col>
		</v-row>
		<br />
		<v-progress-linear
			indeterminate
			color="cyan"
			v-show="showProgressBar"
		></v-progress-linear>
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
import config from "../../config"
import uploadCollection from './upload-collection.vue'
import createDataset from './create-dataset.vue'
import CollectionSelector from '../metadata/collection-selector.vue'

export default {
	name: "datainfo",
	components: {
		uploadCollection,
		createDataset,
		CollectionSelector,
	}, 
	
	data: () => ({
		infoToUser: '',
		showProgressBar: false,
		renderKey: 0,
		txt: {
			btn: {
				delete: "Delete All Created Datasets",
				create: "Create Dataset",
				get: "Get tables",
				upload: 'Upload Collection',
				deleteCollection: 'Delete A Collection',
				deleteTheCollection: 'Delete Selected',
			}
		},
		collectionSelected: '',
		show: {
			upload: false,
			create: false,
			deleteCollection: false
		}
	}),
	methods: {
		async getTables(){
			this.show.create = false
			this.show.upload = false
			this.infoToUser = ''
			this.showProgressBar = true
			let tablenames = await axios.get(config.localApi + "/datainfo/collectionnames")
			this.infoToUser = tablenames.data.join(", ")
			this.showProgressBar = false
		},
		async createDataset(){
			this.show.create = true
			this.show.upload = false
			this.show.deleteCollection = false
			this.infoToUser = ''
		},
		async deleteAllDatasets(){
			this.show.create = false
			this.show.upload = false
			this.infoToUser = ''
			this.showProgressBar = true
			let res = await axios.delete(config.localApi + "/datainfo/collections")
			this.infoToUser = res.data.message
			this.showProgressBar = false
		},
		deleteCollection() {
			this.renderKey += 1
			this.show.upload = false
			this.show.create = false
			this.show.deleteCollection = !this.show.deleteCollection
		},
		async deleteTheCollection(){
			this.show.create = false
			this.show.upload = false
			this.infoToUser = ''
			this.showProgressBar = true
			let res = await axios.delete(config.localApi + "/datainfo/collection", {
				data: {
					collectionName: this.collectionSelected.text
				}
			})
			this.infoToUser = res.data.message
			this.showProgressBar = false
		},
		uploadCollection(){
			this.show.upload = !this.show.upload
			this.show.deleteCollection = false
			this.show.compositeContentDescriptor = false
			this.show.create = false
		},
		setInfoToUser(value){
			this.infoToUser = value
		},
		setProgressBar(value){
			this.showProgressBar = value
		},
		updateSelectedCollection(collection){
			this.collectionSelected = collection
		},
    }
}
</script>

<style>

.deleteCollection{
	width: 90%;
	padding-bottom: 25px;
	padding-left: 10%;
}

.deleteCollectionButton{
	margin: 25px;
}

</style>