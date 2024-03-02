import http from "http";

const server = http.createServer(function handleRedirects(request, response) {
        try {
                response.writeHead(301, { location: "https://" + request.headers.host + request.url });
                response.end();
        } catch(e) {
                response.writeHead(404);
                response.end();
        }
});

export default server;