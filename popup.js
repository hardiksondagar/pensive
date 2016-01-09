function setDOMInfo(d) {
    $(".word-list").html("");
    console.log(d);
    if (Object.keys(d).length < 1) {
        $(".no-word-message").css("display", "block")
    } else {
        $(".no-word-message").css("display", "none")
    }
    for (var c in d) {
        var a = document.createElement("li");
        a.className = "list-group-item";
        var b = document.createElement("span");
        b.className = "badge";
        b.innerHTML = d[c];
        a.innerHTML = c;
        $(a).append(b);
        console.log(a);
        $(".word-list").append(a)
    }
}
window.addEventListener("DOMContentLoaded", function() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(a) {
        chrome.tabs.sendMessage(a[0].id, {
            from: "popup",
            subject: "DOMInfo"
        }, setDOMInfo)
    })
});
$("#clear-data").on("click", function() {
    chrome.runtime.sendMessage({
        action: "clear"
    }, function(a) {
        console.log("data clear")
    })
});
$("#onoff").on("click", function() {
    var a = $("#onoff").prop("checked");
    console.log($("#onoff").prop("checked"));
    chrome.runtime.sendMessage({
        action: "switch",
        value: a
    }, function(b) {
        console.log("switch to %s", a)
    })
});

function setSwitch() {
    chrome.storage.local.get("chrome_pensive_on_off", function(a) {
        $("#onoff").prop("checked", a.chrome_pensive_on_off);
    });
}

$("#addword-btn").on("click", function() {
    $(this).addClass("disabled");
    $(this).html("adding..");
    var a = $("#new-word").val();
    if (a) {
        chrome.runtime.sendMessage({
            action: "addword",
            word: a
        }, function(b) {
            console.log("word added")
        })
    }
    $(this).removeClass("disabled");
    $(this).html("Add Word");
    $("#new-word").val("")
});

chrome.runtime.onMessage.addListener(function(c, b, a) {
    b.tab.id;
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(f) {
        var e = f[0];
        var d = f[0].id;
        if (b.tab.id === d && c.action === "setPopupDom") {
            setDOMInfo(c.info);
            a({
                info: c.info
            })
        }
    });
    return true
});
setSwitch();
chrome.storage.onChanged.addListener(function(b, a) {
    if (a === "chrome_pensive_on_off") {
        setSwitch()
    }
});


$('#suggestion-dropdown').on('click', setSwitch());

$(document).on('click', '#suggestion-dropdown', function()
{

    $('#suggestion-list').html('');
    chrome.storage.local.get("chrome_pensive_suggestion_list_on_off", function(a) {
        $.each(a.chrome_pensive_suggestion_list_on_off, function(i, val) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            var input = document.createElement('input');
            var label = document.createElement('label');
            $(input).attr('type', 'checkbox');
            $(input).attr('name', i);
            $(input).attr('id', 'list-' + i);
            $(input).attr('class', 'suggestion-list-on-off');
            label.innerHTML = ' ' + i + ' ';
            $(a).append(input);
            $(a).append(label);
            $(li).append(a);
            $('#suggestion-list').append(li);
            $('#list-' + i).prop("checked", val);
        });
    });
});

$(document).on("click", ".suggestion-list-on-off", function() {
    var on_off = $(this).prop("checked");

    var name = $(this).attr('name');

    chrome.storage.local.get("chrome_pensive_suggestion_list_on_off", function(a) {
        a.chrome_pensive_suggestion_list_on_off[name] = on_off;
        chrome.storage.local.set({
            chrome_pensive_suggestion_list_on_off: a.chrome_pensive_suggestion_list_on_off
        });
    });

});