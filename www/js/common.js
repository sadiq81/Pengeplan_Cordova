/**
 * Created with IntelliJ IDEA.
 * User: tommysadiqhinrichsen
 * Date: 31/01/14
 * Time: 14.52
 * To change this template use File | Settings | File Templates.
 */
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//var URL = 'https://www.pengeplan.dk/api/user'; LIVE
var URL = 'http://10.0.1.3:8080/api/user'; //Home
//var URL = 'http://192.168.0.114:8080/api/user'; Gilbjerggade
//var URL = 'http://0.0.0.0:8080/api/user'; //City

Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}
Number.prototype.formatMoney = function (decPlaces, thouSeparator, decSeparator) {
    var n = this,
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator == undefined ? "." : decSeparator,
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

String.prototype.contains = function (it) {
    return this.indexOf(it) != -1;
};

var start;

var app = {
    // Application Constructor
    initialize: function (start) {
        this.start = start;
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("pause", this.onDevicePause, false);
        document.addEventListener("online", this.onOnline, false);
        document.addEventListener("offline", this.onOffline, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        if (start != undefined) {
            start();
        }
    },

    onDevicePause: function () {
        app.receivedEvent('pause');
        window.localStorage.clear();
        window.location = 'index.html'
    },

    onOnline: function () {
        app.receivedEvent('online');
        //TODO handle online
    },

    onOffline: function () {
        app.receivedEvent('offline');
        //TODO handle offline
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        console.log('Received Event: ' + id);
    }
};

function checkNetWorkState() {
    var networkState = navigator.connection.type;
    var i = 0;
}

function updateTransactions(callback, defered) {

    //TODO Test for connection
    var credentials = window.localStorage.getObject('credentials');
    var username = credentials.username;
    var password = credentials.password;

    var url = URL + '/transactions/' + username;

    console.log("Trying to get transactions with: url " + url + " username " + username + " password " + "********");

    var client = new XMLHttpRequest();
    client.onreadystatechange = function () {
        if (client.readyState == 4 && client.status == 200) {
            var a = client.responseText;
            var transactions = JSON.parse(a);
            console.log('Fetched ' + transactions.length + ' transactions from db');
            enterTransactionsInDB(callback, defered, transactions);
        } else if (client.readyState == 4 && client.status != 200) {
            handleHTTPErrorMsg(client.status)
        }
    }
    client.open("GET", url, true);
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
    client.send(null);

}

function enterTransactionsInDB(callback, defered, transactions) {
    var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
    db.transaction(function (tx) {
        for (var i = 0; i < transactions.length; i++) {
            tx.executeSql('INSERT OR REPLACE INTO TRANSACTIONS (' +
                'id , transactionType, date, ' +
                'paperName,stockExchange, currency, ' +
                'numberOfItems, valuation, ' +
                'amount, legalEntity, ownedAccount, ' +
                'localAmount) VALUES (?, ?, ?, ' +
                '?, ?, ?, ' +
                '?, ?, ?, ' +
                '?, ?, ?)',
                [transactions[i].id, transactions[i].transactionType, transactions[i].date,
                    transactions[i].paperName, transactions[i].stockExchange, transactions[i].currency,
                    transactions[i].numberOfItems, transactions[i].valuation, transactions[i].amount,
                    transactions[i].legalEntity, transactions[i].ownedAccount, transactions[i].localAmount]);
        }
        callback(defered);
        console.log('Entered transactions in db');
    }, errorCB, successCB)
}

//Commmon

function handleHTTPErrorMsg(statusCode) {

    if (statusCode == 403) {
        navigator.notification.alert("Wrong credentials", null, "Failure", "Dismiss")
    }
    if (statusCode == 404) {
        navigator.notification.alert("Could not contact Pengeplan", null, "Failure", "Dismiss")
    }
}

function errorCB(tx, err) {
    console.log("Error processing SQL: " + err + " - " + tx.message);
}

function successCB() {
    console.log("success!");
}

