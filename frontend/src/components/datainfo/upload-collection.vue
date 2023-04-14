<template>
	<div v-show="show">
		<v-card class="mx-auto my-12">
			<v-alert :type='alert.type' v-show="alert.show">{{alert.message}}</v-alert>
			<v-progress-circular
				indeterminate
				color="primary"
				v-show="showprogress"
			></v-progress-circular>
			<v-card-title>Upload your collection</v-card-title>
			<v-row>
				<v-col md="4">
					<v-card-subtitle>Please provide a <strong>tab separated text file (.tsv extension)</strong> of your collection data.<br>
						<ul>
							<li>The first row must contain the columns names. </li>
							<li><strong>Per collection</strong> only <strong> one text file</strong> is allowed, please flatten your data before upload.</li>
							<li><strong>Units</strong> must be submitted for a column with the "_unit" suffix attached to the column's name: <strong>columnname_unit</strong>.</li>
						</ul>
					</v-card-subtitle>
				</v-col>
				<v-col md="4">
					<v-card-subtitle>Please provide a <strong>tab separated text file (.tsv extension)</strong> for mapping your data.<br>
						There are two columns. <br>
						<ul>
							<li>The first column must contain exactly those columns names form the colleciton file, which you wish to see in the meta-schema. (eg. 'cratinine')</li>
							<li>The second column contains the corresponding LOINC code (eg. 2161-8)</li>
						</ul>
					</v-card-subtitle>
				</v-col>
				<v-col md="4">
					<v-card-subtitle>Please provide a <strong>plain text file (.txt)</strong> of your collection schema.<br>
						There is no header row.<br>
						There is just one column.<br>
						The order of the data types is the same order as the data file columns are following each other.<br>
						The column contains the data type on the data attribute. Allowed data types are the following ones:<br>
						<ul>
							<li>string - every type and length character string</li>
							<li>integer - signed four-byte integer</li>
							<li>double - double precision floating-point number</li>
							<li>timestmap - date and time (no time zone)</li>
						</ul>
					</v-card-subtitle>
				</v-col>
			</v-row>
			

			<v-card-text>
			<v-row>
				<v-col md="4">
					<v-file-input
						show-size
						accept=".tsv"
						label="Data File"
						v-model="fileToUploadData"
					></v-file-input>
				</v-col>
				<v-col md="4">
					<v-file-input
						show-size
						accept=".tsv"
						label="Mapping File"
						v-model="fileToUploadMapping"
					></v-file-input>
				</v-col>
				<v-col md="4">
					<v-file-input
						show-size
						accept=".txt"
						label="Data Schema File"
						v-model="fileToUploadSchema"
					></v-file-input>
				</v-col>
			</v-row>
			<v-text-field
				v-model="collectionName"
				:rules="rules"
				counter="30"
				hint="Name your collection for further identification"
				label="Collection name"
			></v-text-field>
			<v-btn right @click="uploadFile">Upload Collection</v-btn>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
import axios from 'axios'
import config from "../../config"

export default {
	name: 'uploadCollection',
	props: {
		show: {
			type: Boolean,
			required: true
		}
	},
	data(){
		return {
			fileToUploadData: null,
			fileToUploadSchema: null,
			fileToUploadMapping: null,
			data: null,
			collectionName: '',
			rules: [v => v.length <= 30 || 'Max 30 characters'],
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
			if (!this.fileToUploadData || this.fileToUploadData == '' || !this.fileToUploadMapping || this.collectionName == '' || this.fileToUploadSchema == '') {
				this.setAlert('Select a file for the data, the mapping and the schema and fill in the collection\'s name', 'warning')	
			} else {
				try {
					this.showprogress = true
					let formData = new FormData();
					formData.append("files", this.fileToUploadData, 'collection');
					formData.append("files", this.fileToUploadSchema, 'schema');
					formData.append("files", this.fileToUploadMapping, 'mapping');
					formData.set('name', this.collectionName)
					await axios.post(config.localApi + "/collection/upload", formData)
					this.setAlert('File contents were accepted', 'success')	
				} catch (error) {
                    if(error.message == 'Request failed with status code 406')
						this.setAlert('File type is not supported', 'error')
					else if(error.response.status == 500)
						this.setAlert('Error at reading files:' + error.response.data.message, 'error')
					else this.setAlert(`Something went wrong`, 'error')	
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