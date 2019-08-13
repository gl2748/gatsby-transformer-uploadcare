# gatsby-source-thirdparty

A gatsby source plugin for pulling in third party api data.

## Features

* Pulls data from configured api url
* Uses custom name to allow for multiple instances of plugin
* Option to download the json data to a configurable path
* Option to only download the json data, and skip inserting it into GraphQL
* Supports simple authentication through axios

## Install

`npm install --save gatsby-source-thirdparty`

## How to use

```javascript
// Place configuration options in your gatsby-config.js

plugins: [
  {
    resolve: 'gatsby-transformer-uploadcare',
    options: {
        // the target string, fields containing this string will be treated as uploadcare Urls, and this plugin will attempt to fetch data from them.
      targetString: `http://yourapi.com/api/v1/posts`,

      // Optional simple authentication for your uploadcare requests.
      auth: {
        username: 'myusername',
        password: 'supersecretpassword1234'
      },

      // Optional payload key name if your api returns your payload in a different key
      // Default will use the full response from the http request of the url
      payloadKey: `body`,

      // Optionally save the JSON data to a file locally
      // Default is false
      localSave: true,

      //  Required folder path where the data should be saved if using localSave option
      //  This folder must already exist
      path: `${__dirname}/src/data/auth/`

      // Optionally include some output when building
      // Default is false
      verboseOutput: true, // For debugging purposes

      // Optionally skip creating nodes in graphQL.  Use this if you only want
      // The data to be saved locally
      // Default is false
      skipCreateNode: true, // skip import to graphQL, only use if localSave is all you want
    }
  }
];

```

## How to query

Data will be available at the following points in GraphQL.

`allThirdPartyName` or `thirdPartyName` where `Name` is replaced by the name entered in the
configuration options.

### Conflicting keys

Some of the returned keys may be transformed if they conflict with restricted keys used for
GraphQL such as the following `['id', 'children', 'parent', 'fields', 'internal']`

These conflicting keys will now show up as `thirdParty_id`
