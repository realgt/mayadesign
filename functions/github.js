const querystring = require("querystring");
const fetch = require("node-fetch");
require('dotenv').config()

exports.handler = async(event, context) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // When the method is POST, the name will no longer be in the event’s
    // queryStringParameters – it’ll be in the event body encoded as a query string
    const params = querystring.parse(event.body);
    const repo = process.env.GITHUB_REPO;
    const filename = params.fileName;
    const branch = process.env.GITHUB_BRANCH;
    const code = params.html || "<!DOCTYPE html><html></html>";
    const token = process.env.GITHUB_TOKEN;

    let url = "https://api.github.com/repos/" + repo + "/contents/" + filename;
    var data;
    base64content = Buffer.from(code, "utf-8").toString("base64");
    await fetch(url + "?ref=" + branch, {
            headers: { Authorization: "token " + token }
        })
        .then(response => response.json())
        .then(async json => {
            data = json;
            let sha = data["sha"];

            // let decodedContent = Buffer.from(base64content, "base64").toString("utf-8");
            if (base64content != data["content"]) {
                let message = {
                    message: "update",
                    branch: branch,
                    content: base64content,
                    sha: sha
                };

                await fetch(url, {
                        method: "PUT",
                        body: JSON.stringify(message),
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "token " + token
                        }
                    })
                    .then(response => response.json())
                    .then(json => {
                        return {
                            statusCode: 200,
                            body: `${filename}`
                        };
                    })
                    .catch(error => {
                        console.log(error);
                        return {
                            statusCode: 500,
                            body: `${filename}`
                        };
                    });
            } else {
                console.log("nothing to update");
            }


        })
        .catch(error => {
            console.log(error);

        });
    return {
        statusCode: 200,
        body: `${filename}`
    };
};