module.exports = {
    clients: [
        // {
        //   client_id: "foo",
        //   client_secret: "bar",
        //   redirect_uris: [
        //     "https://mpvoxk.sse.codesandbox.io",
        //     "https://jwt.io",
        //     "https://crsjbj.sse.codesandbox.io/handle"
        //   ]
        //   // ... other client properties
        // }
        {
            client_id: "foo",
            redirect_uris: ["https://jwt.io"], // using jwt.io as redirect_uri to show the ID Token contents
            response_types: ["id_token"],
            grant_types: ["implicit"],
            token_endpoint_auth_method: "none"
        }
    ]
}
