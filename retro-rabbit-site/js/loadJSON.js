if (typeof loadJSON !== 'function') {
    function loadJSON(callback, jsonUrl) {
        var xobj = new XMLHttpRequest();

        xobj.overrideMimeType("application/json");
        xobj.open('GET', jsonUrl, true);

        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                callback(xobj.responseText);
            }
        };

        xobj.send(null);
    }
} 