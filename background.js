function updateWord(b, a) {
    var c;
    b = String(b).toLowerCase();
    b = b.trim();
    chrome.storage.local.get("word", function(d) {
        if (jQuery.type(d.word) === "undefined") {
            c = new Array()
        } else {
            c = d.word
        }
        if (a) {
            c.push(b)
        } else {
            c.remove(b)
        }
        c = c.clean(null);
        c = c.clean("");
        c = c.clean(undefined);
        c = $.map(c, function(f, e) {
            return f.toLowerCase()
        });
        c = jQuery.unique(c);
        chrome.storage.local.set({
            word: c
        });
        console.log("word %s has been added", b)
    })
}
chrome.runtime.onMessage.addListener(function(c, b, a) {
    if (c.action === "addword") {
        updateWord(c.word, true)
    } else {
        if (c.action == "removeword") {
            updateWord(c.word, false)
        } else {
            if (c.action == "switch") {
                chrome.storage.local.set({
                    chrome_pensive_on_off: c.value
                })
            } else {
                if (c.action == "clear") {
                    chrome.storage.local.clear()
                }
            }
        }
    }
    if (c.action === "setBadge") {
        chrome.browserAction.setBadgeText({
            text: c.badgeText,
            tabId: b.tab.id
        });
        a({
            badge: c.badgeText
        })
    }
    return true
});
chrome.tabs.onUpdated.addListener(function(b, a, c) {
    chrome.tabs.getSelected(null, function(d) {
        if (a.status == "complete") {

            chrome.tabs.executeScript(b, {
                file: "jquery.js"
            });
            chrome.tabs.executeScript(b, {
                file: "jquery.highlight.js"
            });

        }
    })
});
Array.prototype.remove = function() {
    var e, c = arguments,
            b = c.length,
            d;
    while (b && this.length) {
        e = c[--b];
        while ((d = this.indexOf(e)) !== -1) {
            this.splice(d, 1)
        }
    }
    return this
};
Array.prototype.unique = function() {
    var b = this.concat();
    for (var d = 0; d < b.length; ++d) {
        for (var c = d + 1; c < b.length; ++c) {
            if (b[d] === b[c]) {
                b.splice(c--, 1)
            }
        }
    }
    return b
};
Array.prototype.clean = function(b) {
    for (var a = 0; a < this.length; a++) {
        if (this[a] == b) {
            this.splice(a, 1);
            a--
        }
    }
    return this
};
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "")
};
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "")
};


chrome.storage.local.set({
    chrome_pensive_suggestion_list: chrome_pensive_suggestion_list,chrome_pensive_suggestion_list_on_off:chrome_pensive_suggestion_list_on_off
});


chrome.storage.local.get(null, function(a) {
    if (typeof a.word == "undefined") {
        words = new Array();
        chrome.storage.local.set({
            word: words
        });
    }
    if (typeof a.chrome_pensive_on_off == "undefined") {
        chrome.storage.local.set({
            chrome_pensive_on_off: true
        });
    }

});


//        words = new Array();
//        chrome.storage.local.set({
//            word: words
//        });