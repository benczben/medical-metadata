<script>
import { Bar, mixins } from "vue-chartjs"
const { reactiveProp } = mixins

export default {
  extends: Bar,
  props:['chartData','options'],
  mixins: [reactiveProp],
  data() {
    return {
    
    };
  },
  methods:{
    async update() {
      this.$data._chart.update()
    }
  },
  mounted() {
    this.renderChart(this.chartData, this.options)
  }
};
</script>
