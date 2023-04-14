<template>
	<v-list dense class="mx-10">
		<draggable
			:list="ordinalDistinctValues"
			:disabled="false"
			class="list-group"
			ghost-class="ghost"
			:move="checkMove"
			@start="dragging = true"
			@end="endMoveAndGetNewOrder"
		>
			<v-list-item
			v-for="(element, index) in ordinalDistinctValues"
			:key="element.aggregate_value"
			>
				<v-list-item-icon>
				<v-icon v-text="index+1"></v-icon>
				</v-list-item-icon>
				<v-list-item-content>
				<v-list-item-title 
					v-text="element.aggregate_value">
				</v-list-item-title
				>
				</v-list-item-content>
			</v-list-item>
		</draggable>
	</v-list>
</template>

<script>
import draggable from "vuedraggable"

export default {
	name: "draggableList",
	props: {
		ordinalDistinctValues:{
			type: Array
		},
	},
	components: {
		draggable
	},
	data: () => ({
		currentChangedOrderList: [],
		currentChangedOrder: {},
		dragging: false,
		treeViewForInDragabbleComponent: [],
		sourceColumn: '',
		sourceDatabase: '',
	}),
	methods: {
		async checkMove(e) {
			let sourceDatabase = e.relatedContext?.list[0]?.source_database
			let sourceColumn = e.relatedContext?.list[0]?.column_name
			this.sourceDatabase = e.relatedContext?.list[0]?.source_database
			this.sourceColumn = e.relatedContext?.list[0]?.column_name
			this.currentChangedOrderList = e.relatedContext.list
			if(!this.currentChangedOrder?.sourceDatabase) this.currentChangedOrder[sourceDatabase] = {}
			this.currentChangedOrder[sourceDatabase][sourceColumn] = e.relatedContext.list
			return
		},
		async endMoveAndGetNewOrder() {
			this.draggable = false

			let sourceDatabase = this.sourceDatabase
			let sourceColumn = this.sourceColumn
			let list = this.currentChangedOrderList
			
			if(this.currentChangedOrder && this.currentChangedOrder[sourceDatabase] && this.currentChangedOrder[sourceDatabase][sourceColumn]){
				// check if DB was handled already, if not, then create
				let consideredDataBaseInTreeBoolean = this.treeViewForInDragabbleComponent.map(levelOne => levelOne.id).includes(sourceDatabase)
				if(!consideredDataBaseInTreeBoolean){
					this.treeViewForInDragabbleComponent.push({
					id: sourceDatabase,
					name: sourceDatabase,
					children: []
					})
				}

				// check if the table was handled already, if not, then create
				let consideredColumnInTreeBoolean
				for (let valueOne of Object.values(this.treeViewForInDragabbleComponent)){
					if(valueOne.id == sourceDatabase){
					consideredColumnInTreeBoolean = valueOne.children.map(levelTwo => levelTwo.id).includes(sourceColumn)
					if(!consideredColumnInTreeBoolean){
						valueOne.children.push({
						id: sourceColumn,
						name: sourceColumn,
						children: []
						})
					}
					}
				}

				// construct the leaf nodes for the treee structure
				for (let valueOne of Object.values(this.treeViewForInDragabbleComponent)){
					if(valueOne.id == sourceDatabase){
					for (let valueTwo of Object.values(valueOne.children)){
						let constructedLeafNode = []
						for(let i of list){
						constructedLeafNode.push({
							id: i.aggregate_value,
							name: i.aggregate_value
						})
						}
						valueTwo.children = constructedLeafNode
					}
					}
				}
			}
			this.$emit('createdTreeStructure', this.treeViewForInDragabbleComponent)
		},
	},
}
</script>

<style>

</style>
