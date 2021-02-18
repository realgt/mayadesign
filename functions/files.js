const fetch = require("node-fetch");
exports.handler = async(event, context) => {
    data = [];
    // Only allow GET
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH;
    const token = process.env.GITHUB_TOKEN;

    try {
        let url = "https://api.github.com/repos/" + repo + "/contents/";
        await fetch(url + "?ref=" + branch, {
                headers: { Authorization: "token " + token }
            })
            .then(response => response.json())
            .then(json => {
                if (json) {
                    console.info(json);
                    json.forEach(item => {
                        if (item["type"] == "file") {
                            file = item["name"];
                            if (file.indexOf(".html") >= 0) {
                                let blockedPages = ["login.html", "logout.html"];
                                if (blockedPages.indexOf(file) == -1) {
                                    data.push({
                                        name: file.split(".")[0],
                                        title: file == "index.html" ? "Home" : file,
                                        url: "../" + file,
                                        file: file,
                                        folder: "/",
                                        assets: []
                                    });
                                }

                            }

                        }
                    });
                }

            });

    } catch (err) {
        console.log(err);
    }
    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };

};