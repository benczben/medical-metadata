<template>
  	<div>
		<v-card
			class="mx-auto"
			tile
			color="secondary"
		>
		<v-list rounded>
			<v-subheader>Collections</v-subheader>
			<v-list-item-group
				v-model="selectedItem"
				color="light-blue"
			>
			<v-list-item
				v-for="result in resultList" :key="result" disabled
			>
				<v-list-item-content>
				<v-list-item-title v-text="result"></v-list-item-title>
				</v-list-item-content>
			</v-list-item>
			</v-list-item-group>
		</v-list>
		</v-card>
  	</div>
</template>

<script>
export default {
	name: 'resultList',
	props: {
		resultList: {
			type: Array,
		}
	},
	data() {
		return{
			selectedItem: '',
		}
	},
}
</script>

<style>

</style>