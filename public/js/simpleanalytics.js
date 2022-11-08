(function () {
    function saLoadedLinkEvents() {
        document
        .querySelectorAll("a[data-sa-link-event]")
        .forEach(function (element) {
            var href = element.getAttribute("href");
            var eventName = element.getAttribute("data-sa-link-event");
            if (!href || !window.sa_event || !window.sa_loaded) return;

            element.addEventListener("click", function (event) {
            var target = element.getAttribute("target");
            if (target === "_blank") {
                event.preventDefault();
                window.sa_event(eventName, function () {
                window.location.href = href;
                });
                return false;
            } else {
                window.sa_event(eventName);
                return true;
            }
            });
        });
    }

    if (document.readyState === "ready" || document.readyState === "complete") {
        saLoadedLinkEvents();
    } else {
        document.addEventListener("readystatechange", function (event) {
        if (event.target.readyState === "complete") saLoadedLinkEvents();
        });
    }
})();