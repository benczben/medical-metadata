<template>
<div>
	<v-data-table
		dense
		:headers="headersLocal"
		:items="itemsLocal"
		
		class="elevation-1"
	></v-data-table>
	
</div>
</template>

<script>

export default {
	name: 'dataTable',
	props: {
		items: {
			type: Array
		},
		headers: {
			type: Array
		},
		itemKey: {
			type: String
		}
	},
	data() {
		return {
			itemsLocal: this.items,
			headersLocal: this.headers,
			itemKeyLocal: this.itemKey + Math.random()
		}
	}
}
</script>

<style>

</style>