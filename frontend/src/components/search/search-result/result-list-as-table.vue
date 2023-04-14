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
				v-for="result in resultList" 
				:key="result"
				@click="emitClickedRowByKey(result)"
			>
				<v-list-item-content>
				<v-list-item-title v-text="result"></v-list-item-title>
				<v-card v-show="expandableContentLocal.length > 0 && keyToExpandLocal == result">
					<v-data-table
						dense
						:headers="expandableContentHeadersLocal"
						:items="expandableContentLocal"
						:items-per-page="2000"
						hide-default-footer
						hide-default-header
        				class="elevation-1"
						@click:row="handleClick"
					></v-data-table>
				</v-card>
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
		},
		expandableContent: {
			type: Array
		},
		expandableContentHeaders: {
			type: Array
		},
		expandableItemKey: {
			type: String
		},
		keyToExpand: {
			type: String
		},
	},
	data() {
		return{
			selectedItem: '',
			expandableContentLocal: this.expandableContent,
			expandableContentHeadersLocal: this.expandableContentHeaders,
			keyToExpandLocal: this.keyToExpand,
			expandableItemKeyLocal: this.expandableItemKey,
			tableOptionsLocal: this.tableOptions,
		}
	},
	methods: {
		emitClickedRowByKey(rowKey){
			this.$emit('clickedRow', rowKey)
		},
		handleClick(row) {
            window.open('https://loinc.org/'+row.loinc_code, '_blank')
		}
	}
}
</script>

<style>

</style>