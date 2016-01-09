var isOn = true;
var local_word = {};
jQuery.extend({
    highlight: function(b, k, h, g) {
        if (b.nodeType === 3) {
            var e = b.data.match(k);
            if (e) {
                var c = document.createElement(h || "span");
                var a = document.createElement(h || "span");
                a.className = "popover";
                a.setAttribute("title", "Remove Word");
                c.className = g || "chrome-extension-highlight";
                var j = b.splitText(e.index);
                j.splitText(e[0].length);
                var f = j.cloneNode(true);
                c.appendChild(f);
                c.setAttribute("data-word", $(j).text());
                j.parentNode.replaceChild(c, j);
                a.setAttribute("data-word", $(j).text());
                c.appendChild(a);
                if (window.local_word.hasOwnProperty($(j).text().toLowerCase())) {
                    window.local_word[$(j).text().toLowerCase()]++
                } else {
                    window.local_word[$(j).text().toLowerCase()] = 1
                }
                return 1
            }
        } else {
            if ((b.nodeType === 1 && b.childNodes) && !/(script|style)/i.test(b.tagName) && !(b.tagName === h.toUpperCase() && b.className === g)) {
                for (var d = 0; d < b.childNodes.length; d++) {
                    d += jQuery.highlight(b.childNodes[d], k, h, g)
                }
            }
        }
        return 0
    }
});
jQuery.fn.unhighlight = function(a) {
    var b = {
        className: "chrome-extension-highlight",
        element: "span"
    };
    jQuery.extend(b, a);
    window.local_word = {};
    return this.find(b.element + "." + b.className).each(function() {
        var c = this.parentNode;
        c.replaceChild(this.firstChild, this);
        c.normalize()
    }).end()
};
jQuery.fn.highlight = function(g, b, e) {
    var d = {
        className: "chrome-extension-highlight",
        element: "span",
        caseSensitive: false,
        wordsOnly: false
    };
    jQuery.extend(d, b);

    if (g.constructor === String) {
        g = [g]
    }
    g = jQuery.grep(g, function(j, h) {
        return j != ""
    });
    g = jQuery.map(g, function(j, h) {
        j = String(j);
        return j.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    });
    if (g.length == 0) {
        return this
    }
    var a = d.caseSensitive ? "" : "i";
    var f = "(" + g.join("|") + ")";
    if (d.wordsOnly) {
        f = "\\b" + f + "\\b"
    }
    var c = new RegExp(f, a);
    return this.each(function() {
        jQuery.highlight(this, c, d.element, d.className);
        console.log(window.local_word)
    })
};

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




function callhighlight() {
    window.local_word = {};
    chrome.storage.local.get("chrome_pensive_on_off", function(a) {


        if (typeof a.chrome_pensive_on_off == "undefined") {
            chrome.storage.local.set({
                chrome_pensive_on_off: true
            });
            console.log("Run");
            return
        } else {
            if (a.chrome_pensive_on_off === true) {
                chrome.storage.local.get(null, function(b) {
                    console.log(b);

                    $.each(b.chrome_pensive_suggestion_list, function(i, val) {
                        if (b.chrome_pensive_suggestion_list_on_off[i])
                        {
                            var suggestion_list = [];
                            jQuery.grep(val, function(el) {

                                if (jQuery.inArray(el, b.word) == -1)
                                {
                                    suggestion_list.push(el);
                                }
                            });
                            $("body").highlight(suggestion_list, {'className': 'chrome-extension-pensive pensive-ccc'});
                        }
                        else
                        {
                            $("body").unhighlight({'className': 'chrome-extension-pensive pensive-ccc'});
                        }

                    });








                    $("body").highlight(b.word);

                    
                    chrome.runtime.sendMessage({
                        action: "setBadge",
                        badgeText: String(Object.keys(window.local_word).length)
                    }, function(c) {
                        //console.log("Bedge Set %s", c.badge)
                    });
                    chrome.runtime.sendMessage({
                        action: "setPopupDom",
                        info: window.local_word
                    }, function(c) {
                        //console.log("Dom set %s", c.info)
                    })

                })
            } else {
                $("body").unhighlight();
                $("body").unhighlight({'className': 'chrome-extension-pensive'});
                chrome.runtime.sendMessage({
                    action: "setBadge",
                    badgeText: "0"
                }, function(b) {
                  //  console.log("Bedge Set %s", b.badge)
                });
                chrome.runtime.sendMessage({
                    action: "setPopupDom",
                    info: window.local_word
                }, function(b) {
                  //  console.log("Dom set %s", b.info)
                })
            }
        }
    })
}
callhighlight();
$(document).on("click", ".addword", function() {
    var a = String($(this).data("word")).toLowerCase();
    chrome.runtime.sendMessage({
        action: "addword",
        word: a
    }, function(b) {
        //console.log("word added")
    })
});
$(document).on("click", ".popover", function() {
    var a = String($(this).data("word")).toLowerCase();
    chrome.runtime.sendMessage({
        action: "removeword",
        word: a
    })
});
$(document).on("click", function() {
    $(".addword").remove()
});
chrome.runtime.onMessage.addListener(function(c, b, a) {
    console.log(c);
    if (c.from && (c.from === "popup") && c.subject && (c.subject === "DOMInfo")) {
        a(window.local_word);
        console.log(window.local_word)
    } else {
        if (c.action && (c.action === "switch")) {
            isOn = c.word;
            callhighlight()
        }
    }
});
(function() {
    function a(b) {
        return function(d) {
            var h, c, g;
            if (window.getSelection) {
                h = window.getSelection();
                if (h.getRangeAt && h.rangeCount) {
                    c = window.getSelection().getRangeAt(0);
                    c.collapse(b);
                    var e = document.createElement("span");
                    e.className = "addword";
                    e.setAttribute("data-word", d);
                    e.setAttribute("title", "Add Word");
                    var i = document.createDocumentFragment(),
                            g, f;
                    f = i.appendChild(e);
                    c.insertNode(i)
                }
            } else {
                if (document.selection && document.selection.createRange) {
                    c = document.selection.createRange();
                    c.collapse(b);
                    c.pasteHTML(d)
                }
            }
        }
    }
    insertHtmlBeforeSelection = a(true);
    insertHtmlAfterSelection = a(false)
})();
$(document).on("dblclick", "body", function(b) {
    var a = window.getSelection().toString();
    a = a.replace(/\s+/g, " ");
    console.log(a);
    insertHtmlAfterSelection(a)
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
chrome.storage.onChanged.addListener(function(b, a) {
    for (key in b) {
        var c = b[key];
        $("body").unhighlight();
        $("body").unhighlight({'className': 'chrome-extension-pensive'});
        callhighlight();
        //console.log('Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".', key, a, c.oldValue, c.newValue)
    }
});

