// ==UserScript==
// @name         Delete Floobits Workspaces
// @namespace    http://your.homepage/
// @version      0.1
// @description  bulk deletion options
// @author       Benjamin Zarzycki
// @match        https://floobits.com/HackReactor*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_openInTab
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==

if (document.URL === 'https://floobits.com/HackReactor') {

    var close = GM_getValue('close', 0);
    if (close > 0) {
        GM_setValue('close', close - 1);
        window.close();
    }

    function MarkButton (domNode, href){
        this.node = $(domNode);
        this.href = href;
        this.button = $('<button class="btn btn-info" style="background-color: pink">Mark</button>');
        this.button[0].addEventListener('click', this.select.bind(this), true);
        this.state = 'unmarked';
        this.node.next().after(this.button);
    };

    MarkButton.prototype.select = function () {
        if (this.state === 'marked') {
            this.state = 'unmarked';
            this.button.html('Mark'); 
            this.node.parent().parent().attr('style', '');
            this.button.attr('style', 'background-color: pink');
        } else {
            this.state = 'marked';
            this.button.html('Unmark');
            this.node.parent().parent().attr('style', 'background-color: pink');
            this.button.attr('style', 'background-color: red');
        }
    };

    MarkButton.prototype.queueForDeletion = function () {
        if(this.state === 'marked') {
            GM_setValue(this.href, 'delete');
            GM_openInTab(this.href, {active: false});
            GM_setValue('close', GM_getValue('close', 0) + 1);
        }
    };

// Potential future feature to allow user to cancel a deletion(s) if they act fast enough.
//    MarkButton.prototype.deQueueForDeletion = function () {
//        GM_deleteValue(this.href);
//    };



    var workspaces = $('.info-workspace-name');
    var buttons = [];
    var selAllStatus = false;

    for (var i = 0; i < workspaces.length; i++) {
        buttons.push( new MarkButton(workspaces[i], $('.info-workspace-buttons')[i].children[0].href) );
    }

    var selAll = $('<button class="btn btn-info" style="background-color: pink">Select All</button>');
    var firstDB = $('<button class="btn btn-info" style="background-color: red">DELETE SELECTED</button>');
    var lastDB = $('<button class="btn btn-info" style="background-color: red">DELETE SELECTED</button>');
    $('.info-workspace-item').first().before( firstDB );
    firstDB[0].addEventListener('click', deleteSelected, true);
    firstDB.after(selAll);
    selAll[0].addEventListener('click', selAllFun, true);
    $('.info-workspace-item').last().after( lastDB );
    lastDB[0].addEventListener('click', deleteSelected, true);

    function deleteSelected () {
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].queueForDeletion();
        }
        setTimeout(document.location.reload.bind(document.location), 10000);
    };

    function selAllFun () {
        if (selAllStatus) {
            selAllStatus = false;
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].state = 'marked';
                buttons[i].select();
            }
        } else {
            selAllStatus = true;
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].state = 'unmarked';
                buttons[i].select();
            }
        }
    };
    
}

else if (document.URL.endsWith('settings')) {
    console.log('keys in storage', GM_listValues());
    
    var key = document.URL;
    var marked = GM_getValue(key);
    if (marked === 'delete') {
        GM_deleteValue(key);
        $('input.btn-danger').click();
    }    
}
