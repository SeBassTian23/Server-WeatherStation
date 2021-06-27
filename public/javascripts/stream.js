
if (typeof (EventSource) !== "undefined") {
    console.log('Server-sent events supported.');

    var source = new EventSource("data/stream");

    source.addEventListener('message', function (e) {
        console.log(e.data);
        location.reload();
    }, false);

    source.addEventListener('open', function (e) {
        console.log("Connection opened");
    }, false);

    source.addEventListener('error', function (e) {
        if (e.readyState == EventSource.CLOSED) {
            console.log("Connection closed");
        }
    }, false);

} else {
    console.log('Sorry! No server-sent events support...');
}