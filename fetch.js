const axios = require(`axios`)
const fs = require('fs')
const stringify = require(`json-stringify-safe`)
const httpExceptionHandler = require(`./http-exception-handler`)
const chalk = require('chalk')
const log = console.log

async function fetch({
  url,
  publicKey,
  uploadcareId,
  name,
  localSave,
  path,
  payloadKey,
  auth,
  verbose,
  reporter
}) {

  let allRoutes

  // Attempt to download the data from api
  /*
  //https://upload.uploadcare.com/info/?pub_key=7b969f8af066608712d4\&file_id=df8f2b0d-8905-4f77-ac9a-fe25f0506d4f
  onst uploadcareFileId = upUrl.split('/')[3]
            return `https://upload.uploadcare.com/info/?pub_key=${publicKey}\\&file_id=${uploadcareFileId}`
  */
 const params = new URLSearchParams()
 params.append('pub_key', publicKey)
 params.append('file_id', uploadcareId)
 
  try {
    let options = {
      method: `get`,
      url: 'https://upload.uploadcare.com/info/',
      params: params,
    }
    if(auth) {
      options.auth = auth
    }
    allRoutes = await axios(options)
  } catch (e) {
    httpExceptionHandler(e, reporter)
  }

  if(allRoutes) {
    // console.log(`allRoutes: `, allRoutes.data);

    // Create a local save of the json data in the user selected path
    if(localSave) {
      try {
        fs.writeFileSync(`${path}${name}.json`, stringify(allRoutes.data, null, 2))
      } catch(err) {
        reporter.panic(`Plugin transformer uploadcare could not save the file.  Please make sure the folder structure is already in place.`, err)
      }

      if(verbose) {
        log(chalk`{bgCyan TransformerUploadCare} ${name}.json was saved locally to ${path}`)
      }
    }

    // Return just the intended data
    if(payloadKey) {
      return allRoutes.data[payloadKey]
    }
    return allRoutes.data
  }
}

module.exports = fetch
