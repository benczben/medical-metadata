<template>
	<div>
		<div v-if="showBarChart && !qualityChart">
			<BarChart
				ref="model_one_chart"
				:chart-data="chartDataJS"
				:options="options"
				:height="600"
			/>
		</div>
		<div v-if="showBarChart && qualityChart">
			<BarChart
				ref="model_two_chart"
				:chart-data="chartDataQuality"
				:options="optionsQuality"
				:height="600"
			/>
		</div>
	</div>
</template>

<script>
import BarChart from './barchart.vue'
import moment from 'moment'

const options = {
	responsive: true, 
	maintainAspectRatio: false,
	tooltips: {
        yAlign: "top",
	},
	layout: {
		padding: {
			bottom: 250
		}
	},
}

const optionsQuality = {
	responsive: true, 
	maintainAspectRatio: false,
	tooltips: {
        yAlign: "top",
	},
	layout: {
		padding: {
			bottom: 250
		}
	},
}

export default {
	components: {
		BarChart,
	},
	props: {
		barChartRenderCounter: {},
		showBarChart: {},
		dataSourcesArray: {},
		mappedDataRes: {},
		qualityChart: {
			requred: false,
			type: Boolean,
			default: false,
		},
		yLabel: {
			type: String,
			required: false
		},
		xLabel: {
			type: String,
			required: false
		},
		datasetLabel: {
			type: String,
			required: false
		},
		XAxesPropertyName: {},
		tooltipInfoFor: {
			required: false,
			type: Array,
		},
		tooltipInfoForLabel: {
			required: false,
			type: String,
		},
		timelinessUnit: {
			required: false,
			type: String,
		}
	},
	data() {
		return {
			chartDataJS: {
				labels: [],
				datasets: []
			},
			options,
			chartDataQuality: {
				labels: [],
				datasets: []
			},
			optionsQuality,
		}
	},
	watch: {
		barChartRenderCounter: {
			handler: async function () {
				if(!this.qualityChart) await this.renderChart(this.dataSourcesArray, this.mappedDataRes)
				else await this.renderQualityChart(this.mappedDataRes)
			}
		}
	},
	methods: {
		async renderChart(dataSourcesArray, mappedDataRes){
           	let merged = []
			let chartData= []
			let chartLabels = []
			let dataValuesCounterForPadding = 0
			for(let datasource of dataSourcesArray){
				let dataValueCounts = mappedDataRes.data
					.filter(data => data.source_database == datasource)
					.map(data => data.occurance_count)

				for(let padding = 0; padding < dataValuesCounterForPadding; padding++){
					dataValueCounts.unshift('')
				}
				let infoBox
				let dataValuesAsLables = mappedDataRes.data
					.filter(data => data.source_database == datasource)
					.map(data => {
						if(data.value_unit){
							infoBox = `${Number(data.aggregate_value).toFixed(4)} ${data.value_unit}
								\nMin: ${Number(data.min_value).toFixed(4)}
								\nMax: ${Number(data.max_value).toFixed(4)}
								\nMean: ${Number(data.mean_value).toFixed(4)}
								\nMedian: ${Number(data.median_value).toFixed(4)}
								\nMin date: ${moment(data.min_updated_at).format("YYYY-MM-DD hh:mm")}
								\nMax date: ${moment(data.max_updated_at).format("YYYY-MM-DD hh:mm")}
								\nMean date: ${moment(data.mean_updated_at).format("YYYY-MM-DD hh:mm")}
								\nMedian date: ${moment(data.median_updated_at).format("YYYY-MM-DD hh:mm")}
								`
							return infoBox
						}
						// else for non-qunatitative values
						return `${data.aggregate_value}
								\nMin date: ${moment(data.min_updated_at).format("YYYY-MM-DD hh:mm")}
								\nMax date: ${moment(data.max_updated_at).format("YYYY-MM-DD hh:mm")}
								\nMean date: ${moment(data.mean_updated_at).format("YYYY-MM-DD hh:mm")}
								\nMedian date: ${moment(data.median_updated_at).format("YYYY-MM-DD hh:mm")}
								`
					} 
				)
				
				chartLabels.push(dataValuesAsLables)
				chartData.push({
					'label': datasource,
					'borderColor': 'white',
					'pointBackgroundColor': 'white',
					'borderWidth': 1,
					'pointBorderColor': 'red',
					'backgroundColor': this.getRandomColor(),
					'data': dataValueCounts
				})

				dataValuesCounterForPadding = dataValueCounts.length
			}

			merged = [].concat.apply([], chartLabels)
			this.chartDataJS.datasets = chartData
			this.chartDataJS.labels = merged
			// build y axes
			this.options['scales'] = {};
			this.options.scales['yAxes'] = []
			this.options.scales['yAxes'].push({
				scaleLabel: {
					display: true,
					labelString: 'Occurance Count'
				}
			})

			// build custom labels for x axes
			this.options.scales['xAxes'] = []
			this.options.scales['xAxes'].push({
				display: true,
				ticks: {
					userCallback: function(label, index, labels) {
						index
						labels
						if(typeof label === "string") return label.split('\n')[0]
						else return label
						}
				}
			})
			
			await this.updateChart()
		},
		async renderQualityChart(mappedDataRes) {
            if(mappedDataRes.data && mappedDataRes.data.length > 0) {
				let chartData = {
					labels: mappedDataRes.data.map(x => {
						let tooltip = ''
						console.log(this.tooltipInfoFor[0])
						if(this.tooltipInfoFor.includes('collection_completeness')) {
							tooltip = Number(x[this.tooltipInfoFor]).toFixed(2) + '%'
							return x.source_database + '\n ' + this.tooltipInfoForLabel + ': ' +  tooltip
						}
						else if(this.tooltipInfoFor.includes('collection_accuracy')) {
							tooltip = Number(x[this.tooltipInfoFor]).toFixed(2)
							return x.source_database + ' - accuracy: ' + x.tuple_accuracy + '\n ' + this.tooltipInfoForLabel + ': ' +  tooltip
						} 
						else if(this.tooltipInfoFor.includes('source_database')) {
							tooltip = x[this.tooltipInfoFor]
							return x.source_database + '\n ' + 'Group Timeliness' + ': ' +  x.timeliness + ' ' + this.timelinessUnit +
									'\n ' + 'Collection Weighted Avg. Timeliness' + ': ' +  Number(x.collection_timeliness).toFixed(2) + ' ' + this.timelinessUnit
						} 
						else console.log('unknown type: ' + typeof(x[this.tooltipInfoFor]))
						
						
					}),
					datasets: [
						{
							label: this.datasetLabel,
							data: mappedDataRes.data.map(x => Number(x[this.XAxesPropertyName]).toFixed(2)),
							borderColor: 'white',
							pointBackgroundColor: 'white',
							borderWidth: 1,
							pointBorderColor: 'red',
							backgroundColor: this.getRandomColor(),
						},
					],
				}
				
				let optionsConfig = {
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: this.yLabel
						}	
					}],
					xAxes: [{
						scaleLabel: {
							display: true,
							labelString: this.xLabel
						},
						ticks: {
							userCallback: function(label, index, labels) {
								index
								labels
								if(typeof label === "string") return label.split('\n')[0]
								else return label
							}
						}
					}]
				}

				this.optionsQuality['scales'] = optionsConfig
				this.chartDataQuality = chartData
			}
		},
		async updateChart () {
			this.$refs.model_one_chart.update()
		},
		getRandomColor() { 
			// source for getRandomColor: https://stackoverflow.com/questions/1484506/random-color-generator
			let letters = '0123456789ABCDEF'
			let color = '#'
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)]
			}
			return color
		},
	},
	created() {
		if(this.showBarChart && !this.qualityChart) this.updateChart()
	},
}
</script>

<style>

</style>