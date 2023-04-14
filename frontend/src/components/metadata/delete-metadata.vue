<template>
	<div v-show="showDelete">
		
	</div>
</template>

<script>
export default {
	name: 'deleteMetadata',
	props: {
		showDelete: {
			type: Boolean,
			required: true,
		}
	},
	data(){

	},
}
</script>

<style>

</style>