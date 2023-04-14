<template>
	<div v-show="show">
		<v-card class="mx-auto my-12">
			<v-alert :type='alert.type' v-show="alert.show">{{alert.message}}</v-alert>
			<v-progress-circular
				indeterminate
				color="primary"
				v-show="showprogress"
			></v-progress-circular>
			<v-card-title>Import your metadata from own sources</v-card-title>
			<v-row>
				<v-col md="6" offset="3">
					<v-card-subtitle>If You've decided to create your own metadata about Your collection, please provide a <strong>JSON structured file</strong> which contain the needed information.<br>
						If You are not sure about the creation <router-link to="/datainfo">here</router-link>, you can upload your collection and You'll be guided through the metadata creation process.
					</v-card-subtitle>
				</v-col>
			</v-row>
			
			<v-card-text>
			<v-row>
				<v-col md="6" offset="3">
					<v-file-input
						show-size
						accept=".json"
						label="Metadata File"
						v-model="fileToUploadMetaData"
					></v-file-input>
				</v-col>
			</v-row>
			<v-btn right @click="uploadFile">Import Metadata</v-btn>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
import axios from 'axios'
import config from "../../config"

export default {
	name: 'importMetadata',
	props: {
		show: {
			type: Boolean,
			required: true
		}
	},
	data(){
		return {
			fileToUploadMetaData: null,
			data: null,
			alert:{
				type: 'info',
				show: false,
				message: ''
			},
			showprogress: false,
		}
	},
	methods: {
		async uploadFile(){
			if (!this.fileToUploadMetaData) {
				this.setAlert('Select a file for the metadata to proceed', 'warning')	
			} else {
				try {
					this.showprogress = true
					let formData = new FormData()
					formData.append("files", this.fileToUploadMetaData, 'metadata')
					let res = await axios.post(config.localApi + '/metadata/import', formData)
					console.log({ res })
					this.setAlert(`Metadata uploaded, items added: ${res.data.itemsCount}`, 'success')	
				} catch (error) {
					this.setAlert(`Something went wrong`, 'error')	
				}
				this.showprogress = false
			}
		},
		setAlert(message, type){
			this.alert.show = true
			this.alert.type = type
			this.alert.message = message
			setTimeout(() => this.alert.show = false, 7500)
		}
	}
}
</script>

<style>

</style>