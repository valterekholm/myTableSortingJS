/*
The initializing is called like
makeRowsSortableWithLinks(document.getElementById("table1"), false);
*/
function makeRowsSortableWithLinks(table, useCookies) {

    if (getSortableRowsLength(table) < 2) return false;

    var tbl = table;
    
    if(typeof getTHead(tbl) == "undefined"){
        makeTHead(tbl);
    }
    var width = getTableWidth(tbl);
    for (var i = 0; i < width; i++) {
        var lin = null;
        if (getTHead(tbl).children[0].children[i].children.length == 0) {//om inte finns länkar i th
            lin = document.createElement("a");
            lin.href = "#";
            lin.innerHTML = getTHead(tbl).children[0].children[i].innerHTML;
            lin.id = "col" + i;
        }
        else {
            //om redan finns länk som th
            //console.log("Finns redan länk");
            lin = getTHead(tbl).children[0].children[i].children[0];
        }

        lin.addEventListener("click", function () {

            //console.log(this.id);
            //Hämta första tbody
            var tb1 = tbl.tBodies[0];
            //urklippt
            makeSort(tb1, this.parentNode);

        });

        getTHead(tbl).children[0].children[i].innerHTML = "";
        getTHead(tbl).children[0].children[i].appendChild(lin);//Sätt in länk i kolumn-rubrik
    }

    if (useCookies) {
        if (checkCookie("sortorder")) {
            sortTableByColumn(table, getCookie("sortorder"));
        }
    }
    return getSortableRowsLength(table);
}

function getMyCol(th) {

    var count = 0;
    var temp = th;
    while ((temp = temp.previousElementSibling) != null) {
        count++;
    }//count blir position för th / den kolumn som ska sorteras

    //console.log(count);
    var col = [];

    var tb = th.parentNode.parentNode.nextElementSibling;//table body
    //console.log(tb.innerHTML);
    var tr = tb.children[0];//första <tr>

    var counter = 0;

    do {
        //Ett objekt skapas
        var pair = { key: counter, value: tr.children[count].innerHTML };

        col.push(pair);

        tr = tr.nextElementSibling;
        counter++;

    } while (tr != null)

    return col;
}


function getPairData(pair) {
    return pair.key + ":" + pair.value;
}

function sortTableAsColumn(tbody, colArray) {
    //console.log("-----sortTableAsColumn med tbody " + tbody + " och " + colArray);
    var len = colArray.length;
    //gör ny tbody
    var tb2 = document.createElement("tbody");
    for (var i = 0; i < len; i++) {//rad för rad
        var tr = document.createElement("tr");

        //console.log("Ska kopiera rad " + i + " " + colArray[i].key);

        //alert(tbody.innerHTML);
        //alert(colArray[i].key);

        var td = tbody.children[colArray[i].key].children[0];

        if (typeof td == "undefined") {
            return false;
        }
        do {//hämta en hel rad

            var newtd = document.createElement("td");
            newtd.innerHTML = td.innerHTML;
            td = td.nextElementSibling;
            tr.appendChild(newtd);
        } while (td != null);
        //har fått en hel table row(?)
        //console.log("Ska appenda " + tr.innerHTML);
        tb2.appendChild(tr);
    }

    //console.log("Gamla: " + tbody.innerHTML);
    //console.log("Nya: " + tb2.innerHTML);
    //tbody = tb2;

    var parent = tbody.parentNode;

    parent.removeChild(tbody);
    parent.appendChild(tb2);//exchanging the old tdata for the new
}

//traverse siblings content and erase class content
function eraseSiblingClasses(elem) {

    var sib = elem.nextElementSibling;

    while (sib != null) {//gå åt höger

        sib.className = "";
        sib = sib.nextElementSibling;
    }

    var sib = elem.previousElementSibling;

    while (sib != null) {//vänster

        sib.className = "";
        sib = sib.previousElementSibling;
    }
}

// Used by the local array.sort function implementation
// Sorts array elements in ascending order numerically.  
function CompareValueForSort(first, second) {
    return first.value.localeCompare(second.value);
}
function CompareValueForSortReverted(first, second) {
    return first.value.localeCompare(second.value) * -1;
}

// Taken from www.w3schools.com
function setCookie(cname, cvalue, exsec) {
    console.log("setCookie med " + cname + ", " + cvalue + ", " + exsec);
    var d = new Date();
    //d.setTime(d.getTime() + (exdays*24*60*60*1000));
    d.setTime(d.getTime() + (exsec * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    console.log("getCookie med " + cname);
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {//strip?
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            //console.log("Ska returnera " + c.substring(name.length, c.length));
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var sortorder = getCookie("sortorder");//namn på kolumn
    if (sortorder != "") {
        console.log("Sortorder cookie is " + sortorder);
        return true;
    } //else {
    //        username = prompt("Please enter your name:", "");
    //        if (username != "" && username != null) {
    //            setCookie("username", username, 365);
    //        }
    //    }

    return false;
}

//Instead of click
//Search / find the column named clmName
function sortTableByColumn(tbl, clmName) {
    //console.log("sortTableByColumn med " + tbl + ", " + clmName);
    var thead = getTHead(tbl);
    var tbody = getTBody(tbl);
    var width = getTableWidth(tbl);
    var tr = thead.children[0];
    var name = "";
    for (var i = 0; i < width; i++) {
        //per th
        //hitta kolumnens namn

        name = getInnermostText(tr.children[i]);

        if (name == clmName) {
            //hittade kolumnen(?)
            //alert("Hittade... " + name);
            makeSort(tbody, tr.children[i]);
        }
    }
}

//Count table width (for one th-row), not regarding colspan
function getTableWidth(tbl) {
    console.log(getTHead(tbl).children[0].children.length);
    return getTHead(tbl).children[0].children.length;
}

//Go in nested elements until only text (if any) remains
function getInnermostText(elem) {
    var name = "";
    if (elem.children.length == 0) {
        name = elem.innerHTML;
    }
    else {
        var temp = elem.children[0];
        while (temp.children[0] != null) {
            temp = temp.children[0];
        }
        name = temp.innerHTML;
    }
    return name;
}

//Tar in en tbody och en th
//Sorterar först en kolumn, sen hela tabellen 
function makeSort(tb1, th) {
    //console.log("-----makeSort med tb1 " + tb1 + " och " + th);
    var col = getMyCol(th);//th
    var sortDirection = null;

    //Kontroll av sorteringsriktning

    //var th = this.parentNode;
    if (th.className == "") { //ursprungs-läge
        th.className = "asc";
        col.sort(CompareValueForSort);//function(a,b){return a.value > b.value}
        sortDirection = "asc";
    }
    else if (th.className == "asc") {
        //omvänd
        th.className = "desc";
        //sorterar
        col.sort(CompareValueForSortReverted);
        sortDirection = "desc";
    }
    else if (th.className == "desc") {
        //omvänd
        th.className = "asc";
        //sortera
        col.sort(CompareValueForSort);
        sortDirection = "asc";
    }

    //ta bort innehåll från alla andra th:s class...

    eraseSiblingClasses(th);

    //sortera tabell efter array col
    sortTableAsColumn(tb1, col);


    //spara sortorder i cookie

    setCookie("sortorder", getInnermostText(th), 10);
}

//if missing
function makeTHead(tbl){
    var header = tbl.createTHead();
    var fth = tbl.getElementsByTagName("tr")[0];
    header.appendChild(fth);
}

function getTHead(tbl) {
    return tbl.getElementsByTagName("thead")[0];
}

function getTBody(tbl) {
    return tbl.getElementsByTagName("tbody")[0];
}

function getSortableRowsLength(tbl) {
    return (getTBody(tbl).children.length);
}
