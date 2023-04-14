import Vue from 'vue'
import VueRouter from 'vue-router'
import Search from './../components/search/from.vue'
import Datainfo from './../components/datainfo/datainfo.vue'
import Metadatamanager from './../components/metadata/metadata-manager.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: "/search",
        name: "search",
        component: Search
    },
    {
        path: "/datainfo",
        name: "datainfo",
        component: Datainfo
    },
    {
        path: "/metadatamanager",
        name: "metadatamanager",
        component: Metadatamanager
    }
]

const router = new VueRouter({
    mode: 'history',
    routes: routes
})

export default router;