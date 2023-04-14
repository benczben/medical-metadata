<template>
	<v-app>
		<v-app-bar
			app
			color="secondary"
			dark
		>
			<div class="d-flex align-center">
			<h1
				alt="project-medical-metadata"
				class="shrink mt-1 hidden-sm-and-down"
				contain
				min-width="100"
				width="100"
			>medical-metadata</h1>
			</div>

			<v-spacer></v-spacer>
			<v-btn
			href="https://git-isys.aau.at/ics/bbmri/medical-metadata/tree/master/"
			target="_blank"
			text
			>
			<span class="mr-2">{{txt.gotoGitlab}}</span>
			<v-icon>mdi-open-in-new</v-icon>
			</v-btn>
		</v-app-bar>

		<div>
			<div id="nav">        
			<v-tabs>
				<v-tab to="/datainfo">Datainfo</v-tab>
				<v-tab to="/metadatamanager">Metadata manager</v-tab>
				<v-tab to="/search">Search</v-tab>
			</v-tabs>
			</div>
			<router-view />
		</div>
	</v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
  },

  data: () => ({
    txt: {
      gotoGitlab: "go to the gitlab repo"
    }
  }),
};
</script>

<style scoped>
  #nav{
    padding: 60px;
    padding-left: 35%;
  }
</style>
