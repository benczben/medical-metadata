<template>
	<v-list dense class="mx-10">
		<draggable
			:list="ordinalMappingValueSetArray"
			:disabled="!oderChangeActive"
			class="list-group"
			ghost-class="ghost"
			@start="dragging = true"
			@end="endMoveAndSaveNewOrder"
		>
			<v-list-item
			v-for="(element, index) in ordinalMappingValueSetArray"
			:key="element.value_set_value"
			>
				<v-list-item-icon>
				<v-icon v-text="index+1"></v-icon>
				</v-list-item-icon>
				<v-list-item-content>
				<v-list-item-title 
					v-text="element.value_set_value">
				</v-list-item-title
				>
				</v-list-item-content>
			</v-list-item>
		</draggable>
		<v-btn
			v-show="!oderChangeActive && ordinalMappingValueSetArray.length > 0"
			@click="activateOrderChange"
		>{{txt.changeOrder}}</v-btn>
		<v-btn
			v-show="oderChangeActive"
			class="buttonStyling"
			color="primary"
			@click="saveNewOrderToDatabase"
		>{{txt.saveNewOrder}}</v-btn>
		<v-btn
			v-show="oderChangeActive"
			class="buttonStyling"
			color="secondary"
			@click="cancelOrderChange"
		>{{txt.cancelOrder}}</v-btn>
	</v-list>
</template>

<script>
import draggable from "vuedraggable"
/* import axios from "axios"
import config from "../../config" */

export default {
	name: "draggableList",
	props: {
		ordinalMappingValueSetArray:{
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
		valueSetName: '',
		loincCode: '',
		txt:{
			saveNewOrder: 'Save new order',
			changeOrder: 'Activate order changing',
			cancelOrder: 'Cancel',
			dragValues: 'Now You can drag the values',
			dragValuesCancelled: 'Your changes were not saved',
		},
		oderChangeActive: false,
	}),
	methods: {
		async endMoveAndSaveNewOrder() {
			this.dragging = false
		},
		async saveNewOrderToDatabase(){
			try {
				// add the new_sequence_number prop to the array, which can be sent to the backend after emit
				for (let [index, value] of Object.entries(this.ordinalMappingValueSetArray)){
					value.new_sequence_number = Number(index) + 1
				}
				this.oderChangeActive = false
				this.$emit('chengedOrderOfValueSetArray', this.ordinalMappingValueSetArray)
			} catch (error) {
				console.log(error)	
			}
		},
		activateOrderChange(){
			this.oderChangeActive = true
			this.$emit('orderChangeActivated', this.txt.dragValues, 'success')
		},
		cancelOrderChange(){
			this.oderChangeActive = false
			this.$emit('orderChangeActivated', this.txt.dragValuesCancelled, 'info')
		}
	},
}
</script>

<style  scoped>
.buttonStyling{
	margin-right: 20px;
}
</style>
