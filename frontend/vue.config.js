module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    "devServer":{
      "proxy": {
        "/api": {
        "target": 'http://localhost:3001/api',
        "pathRewrite": { '^/api': '' },
        "changeOrigin": true,
        "secure": false
        },
        '^/CodeSystem': {
        "target": 'https://fhir.loinc.org',
        //"pathRewrite": { '^/CodeSystem': '' },
        "changeOrigin": true,
        //"secure": true
        }
      }
    }
  }
}
