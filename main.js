// ==UserScript==
// @name         Nitrogen Sports Grab Wager Button
// @version      69.69
// @description  Adds button to wagers to allow copy pasting
// @match        https://nitrogensports.eu/*
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==
/*- The @grant directive is needed to work around a major design
    change introduced in GM 1.0.
    It restores the sandbox.
*/

var BUTTON_TEXT = 'Grab bet';
// blank,status,datetime,sport,event,wager,odds,risk,towin
var SPREADSHEET_ROW_FORMAT = 'datetime,odds,blank,blank,risk,towin,blank,sport,event,wager,status';

waitForKeyElements(".mywager-table", addGrabButton);

function addGrabButton(wagerTable) {
    var wagerRows = $(wagerTable).find(".row-fluid");
    wagerRows.splice(0,1); // remove header / description fields
    for(var i = 0; i < wagerRows.length; i++){
        var btn = createButton(wagerRows[i]);
        $(btn).insertBefore(wagerRows[i]); // puts the button on its own line just above the row for your wager
    }
}

function createButton(wager){
    var btn = createButtonElement();
    var wagerInfo = getWagerInfo(wager);
    console.log(wagerInfo);
    wagerInfo = formatPerSpreadsheetVar(wagerInfo);
    console.log(wagerInfo);
    btn.setAttribute("betinfo", wagerInfo);
    return btn;
}

function createButtonElement() {
    var btn = document.createElement("button");
    var btnTxt = document.createTextNode(BUTTON_TEXT);
    btn.appendChild(btnTxt);
    btn.onclick = copyToClipboard;
    return btn;
}

function getWagerInfo(wager){
    var info = "";
    var columnsArray = wager.children;
    for(var i = 0; i < columnsArray.length; i++){
        var col = columnsArray[i];
        var val = col.innerHTML;
        if(i == columnsArray.length - 1) { // don't add comma at the end
            info += val;
        } else {
            info += val + ",";
        }
    }
    return formatPretty(info);
}

// returns wagers in the following format:
// Pending,4 Jan 3:05pm,eSports - CS:GO - CEVO,Chaos v Nexus,Chaos +1.5,1.536 (-187),0.05041,0.02702
// all of these are optional so you can change 'Win' to 'Winning' or whatever else
// I take out 'Match: ' because I don't care to have it
function formatPretty(wager){
    return wager
        .replace('<div class="mywager-table-row-pending-icon">', '')
        .replace('<div class="mywager-table-row-lose-icon">', '')
        .replace('<div class="mywager-table-row-win-icon">', '')
        .replace('<span class="label label-info">', '')
        .replace('<strong>', '')
        .replace('</strong>', '')
        .replace('</span>', '')
        .replace('</div>', '')
        .replace('Pending ', 'Pending')
        .replace('win ', 'Win')
        .replace('lose ', 'Lose')
        .replace('Match: ', '');
}

// this uses SPREADSHEET_ROW_FORMAT to return the wager info in whatever order you want
// assumes order of rows on Nitrogensports.eu is:
// Pending,4 Jan 3:05pm,eSports - CS:GO - CEVO,Chaos v Nexus,Chaos +1.5,1.536 (-187),0.05041,0.02702
// aka status,datetime,sport,event,wager,odds,risk,towin
// aka 0,1,2,3,4,5,6,7
function formatPerSpreadsheetVar(wagerInfo){
    var newWagerString = '';
    var info = wagerInfo.split(',');
    var status = info[0];
    var datetime = info[1];
    var sport = info[2];
    var event = info[3];
    var wager = info[4];
    var odds = info[5];
    var risk = info[6];
    var towin = info[7];
    var usersFormat = SPREADSHEET_ROW_FORMAT.split(',');
    for(var i = 0; i < usersFormat.length; i++){
        var currentPlace = usersFormat[i].toLowerCase().trim();
        console.log(currentPlace);
        if(currentPlace === 'status'){
            newWagerString += status;
        } else if(currentPlace === 'datetime'){
            newWagerString += cuteDatetimeStuff(datetime);
        } else if(currentPlace === 'sport'){
            newWagerString += sport;
        } else if(currentPlace === 'event'){
            newWagerString += event;
        } else if(currentPlace === 'wager'){
            newWagerString += wager;
        } else if(currentPlace === 'odds'){
            newWagerString += odds;
        } else if(currentPlace === 'risk'){
            newWagerString += risk;
        } else if(currentPlace === 'towin'){
            newWagerString += towin;
        } else if(currentPlace === 'blank'){
            newWagerString += ',';
        }else {
            newWagerString += 'ERROR'; // populate a column with error if section was unrecognized
        }

        if(i < usersFormat.length - 1 && currentPlace !== 'blank'){
            newWagerString += ',';
        }
    }
    return newWagerString;
}

function cuteDatetimeStuff(dt) {
    var split = dt.split(' ');
    var date = split[1] + ' ' + split[0] + ' 2017';
    var time = split[2];
    return date + ',' + time;
}

function copyToClipboard() {
    var wager = this.getAttribute("betinfo");
    window.prompt("Copy to clipboard: Ctrl+C, Enter", wager);
}