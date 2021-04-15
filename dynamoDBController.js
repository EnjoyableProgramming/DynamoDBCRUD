const AWS = require('aws-sdk');

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html

const TABLE = "Musica"

var credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });

AWS.config.update({ region: 'us-east-1' });
AWS.config.credentials = credentials;

const docClient = new AWS.DynamoDB.DocumentClient();

const callBack = function (res) {
    return function (err, data) {
        if (err) {
            console.log(err)
            res.send({
                success: false,
                message: err
            });
        } else {
            const { Items } = data;
            res.send({
                success: true,
                Musics: Items
            });
        }
    }
}

const getMusicQuery = function (req, res) {

    let params = {
        TableName: TABLE
    };

    params["KeyConditionExpression"] = (req.query.group && req.query.album)? "#group = :groupValue and #album = :albumValue":(req.query.group)? "#group = :groupValue": undefined

    params["ExpressionAttributeNames"] = {
        "#group": "GroupID",
        "#album": (req.query.album)? "AlbumID" : undefined,
    }

    params["ExpressionAttributeValues"] = {
        ":groupValue": req.query.group,
        ":albumValue": req.query.album,
    }
    
    docClient.query(params, callBack(res));
}

const getMusicScan = function (req, res) {

    let params = {
        TableName: TABLE
    };

    if (req.query.group || req.query.album){
        params["FilterExpression"] = (req.query.group && req.query.album)? "#group = :groupValue and #album = :albumValue":(req.query.group)? "#group = :groupValue":(req.query.album)? "#album = :albumValue":undefined

        params["ExpressionAttributeNames"] = {
            "#group": (req.query.group)? "GroupID" : undefined,
            "#album": (req.query.album)? "AlbumID" : undefined,
        }

        params["ExpressionAttributeValues"] = {
            ":groupValue": req.query.group,
            ":albumValue": req.query.album,
        }
    }
    
    docClient.scan(params, callBack(res));
}

const addMusic = function (req, res) {

    const Item = { ...req.body };

    const params = {
        TableName: TABLE,
        Item: Item,
        ConditionExpression: "attribute_not_exists(#group) and attribute_not_exists(#album)",
        ExpressionAttributeNames: {
            "#group": "GroupID",
            "#album": "AlbumID",
        },
    };

    docClient.put(params, callBack(res));
}

const deleteMusic = function (req, res) {

    const params = {
        TableName: TABLE,
        Key: {
            "GroupID": req.query.group,
            "AlbumID": req.query.album
        }
    };

    docClient.delete(params, callBack(res));
}

const updateMusic = function (req, res) {

    const Item = { ...req.body };

    const params = {
        TableName: TABLE,
        Item: Item,
        Key: {
            "GroupID": req.body.GroupID,
            "AlbumID": req.body.AlbumID
        },
        UpdateExpression: "set #name = :n",
        ExpressionAttributeNames: {
            "#name": req.body.keyToUpdate,
        },
        ExpressionAttributeValues: {
            ":n": req.body.valueUpdated,
        },
        ReturnValues: "UPDATED_NEW"
    };

    docClient.update(params, callBack(res));
}

module.exports = {
    getMusicQuery,
    getMusicScan,
    addMusic,
    deleteMusic,
    updateMusic
}