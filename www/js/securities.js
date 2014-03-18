/**
 * Created with IntelliJ IDEA.
 * User: tommysadiqhinrichsen
 * Date: 09/02/14
 * Time: 13.17
 * To change this template use File | Settings | File Templates.
 */
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


function createDataForPieChartAndList(callback) {

    var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
    db.transaction(function (tx) {

        var startTime = new Date();
        console.log('Starting to refresh pie chart');
        tx.executeSql('SELECT * FROM TRANSACTIONS', [], function (tx, results) {
            if (results.rows.length > 0) {

                console.log('fetched ' + results.rows.length + ' transactions from db in ' + (new Date() - startTime) + " ms");
                var map = new Object();

                for (var i = 0; i < results.rows.length; i++) {
                    var transaction = results.rows.item(i);
                    var securityName = transaction.paperName;

                    var securityExist = map[securityName];

                    if (securityExist == undefined) {
                        map[securityName] = transaction;
                    } else {
                        securityExist.amount += transaction.amount;
                        securityExist.localAmount += transaction.localAmount;
                        securityExist.numberOfItems += transaction.numberOfItems;
                    }
                }

                console.log('Manipulated ' + results.rows.length + ' transactions from db in ' + (new Date() - startTime) + " ms");

                data = [];

                $("#list").empty();

                for (key in map) {
                    data.push({ label: map[key].paperName, data: map[key].localAmount})

                    $('#list').append(
                        $('<li>').attr('class', 'list-row').append(
                            $('<a>').attr('href', '').attr('class', 'list-link').attr('onclick','return false;').append(
                                $('<span>').append(map[key].paperName).append(
                                    $('<span>').attr('style', 'float:right').append(map[key].amount.formatMoney(0, '.', ',') + " " + map[key].currency)
                                ))));
                }
                console.log('Refreshed pie chart and list data with ' + results.rows.length + ' transactions in ' + (new Date() - startTime) + " ms");
                drawPieChart(data);
                if (callback != undefined) {
                    callback();
                }
            } else {
                navigator.notification.alert("No transactions in system, pull to refresh", null, "No transactions", "Dismiss")
                if (callback != undefined) {
                    callback();
                }
            }
        }, errorCB);
    }, errorCB)
}

function drawPieChart(data) {

    $.plot('#placeholder', data, {
        series: {
            pie: {
                show: true,
                radius: 1,
                label: {
                    show: true,
                    radius: 3 / 4,
                    //formatter: labelFormatter,
                    background: {
                        opacity: 0.5,
                        color: '#000'
                    },
                    threshold: 0.1
                }
            }
        },
        legend: {
            show: false
        }
    });
}
