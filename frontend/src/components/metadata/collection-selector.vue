<template>
	<v-card
			class="mx-auto"
			outlined
			v-show="show"
			color="#D7D7D7"
		>
		<v-list-item three-line>
			<v-list-item-content>
				<div class="overline mb-4">
					Select a collection
				</div>
			</v-list-item-content>
		</v-list-item>

		<v-autocomplete
			class="mx-10"
			v-show="show"
			:items="collectionList"
			item-text="text"
			item-key="value"
			:error-messages="collectionSelectedErrors"
			:label="label"
			v-model="collectionSelected"
			single
			return-object
			chips
			required
			style="margin-bottom:25px"
			@change="emitSelectedCollection"
		></v-autocomplete>
	</v-card>
</template>

<script>
import axios from 'axios'
import config from "../../config"
import { required } from 'vuelidate/lib/validators'

export default {
	name: 'collectionSelector',
	props: {
		show: {
			required: true,
			type: Boolean,
		},
		label: {
			required: true,
			type: String,
		},
		triggerLoading: {}
	},
	validations: {
		collectionSelected: { required },
	},
	data(){
		return {
			collectionList: [],
			collectionSelected: '',
		}
	},
	computed: {
		collectionSelectedErrors() {
			const errors = []
			if (!this.$v.collectionSelected.$dirty) return errors
			!this.$v.collectionSelected.required && errors.push('Select one collection to create the meta data model for it.')
			return errors
		},
	},
	methods: {
		async getCollectionNames(){
			let infoToUser = ''
			try {   
				let res = await axios.get(config.localApi + "/collection/names-from-directory")
				this.collectionList = res.data
				infoToUser = 'Select a table from the list'
			} catch (error) {
				infoToUser = '' + error
			}
			this.$emit('info', infoToUser)
		},
		emitSelectedCollection(){
			this.$emit('collectionChanged', this.collectionSelected)
		}
	},
	watch: {
		'triggerLoading': {
			handler: function() {
				console.log('HAS CHANGED')
				this.getCollectionNames()
			}
		}
	},
	mounted() {
		this.getCollectionNames()
	}
}
</script>

<style>

</style>