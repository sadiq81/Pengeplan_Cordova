/**
 * Created with IntelliJ IDEA.
 * User: tommysadiqhinrichsen
 * Date: 09/02/14
 * Time: 13.12
 * To change this template use File | Settings | File Templates.
 */
String.prototype.contains = function (it) {
    return this.indexOf(it) != -1;
};

Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function (key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

function authenticate() {
    //'PengeplanTestApp','cbb-39Z-4Tg-mM5'

    var username = $('#username').val().toLowerCase();
    var password = $('#password').val();
    var pin = $('#pin').val();
    var remember = $('#remember').val();

    if (username.length == 0 || password.length == 0 || (document.getElementById('remember').checked && pin.length == 0)) {
        navigator.notification.alert("Enter credentials to login", null, "Warning", "Dismiss");
        return;
    }

    if (window.localStorage.getItem('persistentLogin') == 'true') {
        testPin(pin);
        return
    }

    var url = URL + '/authenticate/' + username;

    console.log("Trying to login with: url " + url + " username " + username + " password " + "********");

    var client = new XMLHttpRequest();
    client.onreadystatechange = function () {
        if (client.readyState == 4 && client.status == 200) {
            var a = client.responseText;
            var b = JSON.parse(a);
            if (b['authorized'] == true) {
                console.log("Successful login with: url " + url + " username " + username + " password " + "********");
                window.localStorage.setObject('credentials', {username: username, password: password});

                if (document.getElementById('remember').checked) {
                    console.log("Use pin is enabled");
                    persistLogin(username, password, pin)
                }
                window.location = "securities.html";
            } else {
                console.log("Unsuccessful login with: url " + url + " username " + username + " password " + "********");
                navigator.notification.alert("Login unsuccessful", null, "Failure", "Dismiss")
            }
        }
        else if (client.readyState == 4 && client.status != 200) {
            handleHTTPErrorMsg(client.status)
        }
    }

    client.open("GET", url, false);
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
    client.send(null);
}

function testPin(pin) {
    var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
    return db.transaction(function queryDB(tx) {
        tx.executeSql('SELECT * FROM LOGIN', [], function querySuccess(tx, results) {
            if (results.rows.length == 1) {
                var pinFromDB = results.rows.item(0).PIN;
                if (!(pin.valueOf() == pinFromDB.valueOf())) {
                    navigator.notification.alert("Pin was not correct", null, "Warning", "Dismiss");
                } else {
                    window.localStorage.setItem('persistentLogin', 'accepted')
                    authenticate();
                }
            }
        }, errorCB);
    }, errorCB)
}

function hideAlert() {
    $('#pinBlock').show()
}

function showAlert() {
    if (document.getElementById('remember').checked) {
        navigator.notification.alert("Enter a 4-digit pin for subsequent login", hideAlert, "Enter pin", "Dismiss");
    } else {
        $('#pinBlock').hide();
        clearPersistedLogin();
        $('#username').val('');
        $('#username').prop('disabled', false)
        $('#password').val('');
        $('#password').prop('disabled', false)
    }
}

function handleHTTPErrorMsg(statusCode) {

    if (statusCode == 403) {
        navigator.notification.alert("Wrong credentials", null, "Failure", "Dismiss")
    }
    if (statusCode == 404) {
        navigator.notification.alert("Could not contact Pengeplan", null, "Failure", "Dismiss")
    }

}
function persistLogin(username, password, pin) {

    var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('INSERT OR REPLACE INTO LOGIN (id, USERNAME, PASSWORD, PIN) VALUES (?, ?, ?, ?)', [1, username, password, pin]);
        console.log('Persisted login ' + username);
    }, errorCB, successCB)
}

function clearPersistedLogin() {
    var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('DELETE FROM LOGIN');
    }, errorCB, successCB)
    console.log('Cleared login from persistence');
}

function testForPersistedLogin() {
    var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM LOGIN', [], function (tx, results) {
            if (results.rows.length == 1) {
                var username = results.rows.item(0).USERNAME;
                var password = results.rows.item(0).PASSWORD;
                $('#username').val(results.rows.item(0).USERNAME);
                $('#username').prop('disabled', true)
                $('#password').val(results.rows.item(0).PASSWORD);
                $('#password').prop('disabled', true)

                $('#remember').attr('checked', true);
                $('#remember2').attr('checked', true);
                $('#pinBlock').show()

                window.localStorage.setItem('persistentLogin', 'true');
                console.log('Retrieved login from persistence');
            }
        }, errorCB);
    }, errorCB)
}

function setUpDB() {

    var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS LOGIN (id PRIMARY KEY, USERNAME, PASSWORD, PIN)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS TRANSACTIONS (id PRIMARY KEY, transactionType, date DATE, paperName,stockExchange, currency, numberOfItems, valuation, amount, legalEntity, ownedAccount, localAmount)');
    }, errorCB, successCB)
    console.log('DB Setup');
}


//Common

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