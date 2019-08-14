const crypto = require(`crypto`)
const axios = require(`axios`)
const stringify = require(`json-stringify-safe`)
const fetch = require(`./fetch`)
const normalize = require(`./normalize`)

const typePrefix = `transformerUploadcare__`

function isUploadCareUrl(url) {
    return url.search('ucarecdn') === -1 ? false : true;
}

const objToArr = (obj) => {
    return Object.keys(obj).map(k => obj[k])
}

const myReducer = (acc, curr, ix, arr) => {
    if (typeof curr === "string" && isUploadCareUrl(curr)) {
        return [...acc, curr]
    } else if (Array.isArray(curr)) {
        const s = curr.reduce(myReducer, []) // Recur.
        return [...acc, ...s]
    } else if (typeof curr === 'object') {
        const arr = objToArr(curr) // Convert to array.
        const strs = arr.reduce(myReducer, []) // Recur.
        return [...acc, ...strs]
    }
    return acc
}

exports.onCreateNode = async ({
    node,
    loadNodeContent,
    actions,
    //createNode,
    createNodeId,
    reporter
}, {
    publicKey,
    idField = `id`,
    localSave = false,
    skipCreateNode = false,
    path,
    auth = {},
    payloadKey,
    name,
    verboseOutput = false
}) => {

    const {createNode} = actions;

    // Create an entity type from prefix and name supplied by user
    let entityType = `${typePrefix}${name}`

    if (node.internal.type === 'MarkdownRemark' && node.frontmatter !== undefined) {
        const fields = objToArr(node.frontmatter) // Convert to array.
        const uploadCareUrls = fields.reduce(myReducer, []) // Reduce (has a recursion).

        // For each uploadCareUrl fetch its data, and create a node that is related to the current node for that file meta data.
        uploadCareUrls.map((upUrl) => {
            return upUrl.split('/')[3]
            //return `https://upload.uploadcare.com/info/?pub_key=${publicKey}\\&file_id=${uploadcareFileId}`
        }).map(
            async (id) => {
                // We skip auth and payloadkey for the time being.
                console.log('Atempting fetch for:', id)
                let entities = await fetch({
                    uploadcareId: id,
                    publicKey: publicKey,
                    name: name,
                    localSave: localSave,
                    path: path,
                    verbose: verboseOutput,
                    reporter: reporter
                })

                console.log('FETCHED!!!: ', entities)

                // No entities found.
                if (!entities) {
                    return
                }

                // If entities is a single object, add to array to prevent issues with creating nodes
                if (entities && !Array.isArray(entities)) {
                    entities = [entities]
                }

                // console.log(`save: `, localSave);
                // console.log(`entities: `, entities.data);

                // Skip node creation if the goal is to only download the data to json files
                if (skipCreateNode) {
                    return
                }

                // Standardize and clean keys
                entities = normalize.standardizeKeys(entities)

                // Add entity type to each entity
                entities = normalize.createEntityType(entityType, entities)

                // Create a unique id for gatsby
                entities = normalize.createGatsbyIds(createNodeId, idField, entities, reporter)

                // Generate the nodes
                normalize.createNodesFromEntities({ entities, createNode: createNode, reporter, parentNodeId: node.id })

                // We're done, return.
                return
            }
        )
        return
    }
    return
}
/*
exports.sourceNodes = async ({
    boundActionCreators,
    createNodeId,
    reporter
}, {
    url,
    idField = `id`,
    localSave = false,
    skipCreateNode = false,
    path,
    auth = {},
    payloadKey,
    name,
    verboseOutput = false
}) => {
    const { createNode } = boundActionCreators;

    // If true, output some info as the plugin runs
    let verbose = verboseOutput

    // Create an entity type from prefix and name supplied by user
    let entityType = `${typePrefix}${name}`
    // console.log(`entityType: ${entityType}`);

    // Fetch the data
    let entities = await fetch({ url, name, localSave, path, payloadKey, auth, verbose, reporter })

    // If entities is a single object, add to array to prevent issues with creating nodes
    if (entities && !Array.isArray(entities)) {
        entities = [entities]
    }

    // console.log(`save: `, localSave);
    // console.log(`entities: `, entities.data);

    // Skip node creation if the goal is to only download the data to json files
    if (skipCreateNode) {
        return
    }

    // Standardize and clean keys
    entities = normalize.standardizeKeys(entities)

    // Add entity type to each entity
    entities = normalize.createEntityType(entityType, entities)

    // Create a unique id for gatsby
    entities = normalize.createGatsbyIds(createNodeId, idField, entities, reporter)

    // Generate the nodes
    normalize.createNodesFromEntities({ entities, createNode, reporter })

    // We're done, return.
    return
};
*/