<template>
	<div v-show="show">
		<v-card class="mx-auto my-12">
			<v-card-title>Create Collection</v-card-title>
			<v-card-subtitle> Here you have the possibility to create collections filled with generated mock data. You can define the number of desired datasets and the rows in each dataset.
			</v-card-subtitle>

			<v-card-text>
				<form>
					<v-text-field
						v-model="numberOfDatasets"
						:error-messages="numberOfDatasetsErrors"
						:counter="1"
						label="Number of created datasets"
						required
						@input="$v.numberOfDatasets.$touch()"
						@blur="$v.numberOfDatasets.$touch()"
					></v-text-field>
					<v-text-field
						v-model="numberOfRows"
						:error-messages="numberOfRowsErrors"
						:counter="6"
						label="Rows in datasets"
						required
						@change="$v.numberOfRows.$touch()"
						@blur="$v.numberOfRows.$touch()"
					></v-text-field>
					
					<v-btn
						class="mr-4"
						@click="submitCreateDataset(numberOfDatasets, numberOfRows)"
						>
						Submit
					</v-btn>
				</form>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
import axios from "axios"
import config from "../../config"
import { required, maxLength, numeric } from 'vuelidate/lib/validators'

export default {
	name: 'createDataset',
	props: {
		show: {
			type: Boolean,
			required: true
		},
	},
	validations: {
		numberOfDatasets: { required, numeric, maxLength: maxLength(1) },
		numberOfRows: { required, numeric, maxLength: maxLength(6) }
	},
	data(){
		return{
			showProgressBar: false,
			numberOfDatasets: '',
			numberOfRows: '',
			infoToUserLocal: '',
		}
	},
	computed: {
		numberOfRowsErrors () {
			const errors = []
			if (!this.$v.numberOfRows.$dirty) return errors
			!this.$v.numberOfRows.required && errors.push('The field is required')
			!this.$v.numberOfRows.numeric && errors.push('Only numbers are allowed')
			!this.$v.numberOfRows.maxLength && errors.push('Rows must be lower than 1.000.000')
			return errors
		},
		numberOfDatasetsErrors () {
			const errors = []
			if (!this.$v.numberOfDatasets.$dirty) return errors
			!this.$v.numberOfDatasets.maxLength && errors.push('Created datasets must be lower than 10')
			!this.$v.numberOfDatasets.required && errors.push('Created datasets is required.')
			!this.$v.numberOfDatasets.numeric && errors.push('Only numbers are allowed')
			return errors
		}
	},
	methods:{
		async submitCreateDataset() {
			try {
				this.$emit('progress', true)
				this.$emit('infoToUserUpdate', '')
				this.infoToUserLocal = ''
				let res = await axios.post(config.localApi + "/datasets", {
					numberOfDatasets: this.numberOfDatasets,
					numberOfRows: this.numberOfRows
				})
				let currentTablenames = await axios.get(config.localApi + "/datainfo/collectionnames")
				this.infoToUserLocal = `${res.data.message}\nCurrent tables:  ${currentTablenames.data.join(", ")}`
				this.$emit('infoToUserUpdate', this.infoToUserLocal)
				this.$emit('progress', false)
			} catch (error) {
				if (error.response && error.response.status === 400) {
					console.log(error.response);
					this.infoToUserLocal = error.response.data.message
				} else {
					this.infoToUserLocal = JSON.stringify(error)
				}
				this.$emit('infoToUserUpdate', this.infoToUserLocal)
				this.$emit('progress', false)
			}
		},
	}
}
</script>

<style>

</style>