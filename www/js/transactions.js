/**
 * Created with IntelliJ IDEA.
 * User: tommysadiqhinrichsen
 * Date: 09/02/14
 * Time: 19.04
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


function createDataForTransactionsList(callback) {

    var paperName = getURLParameters('name');
    document.getElementById("title").innerHTML= paperName;

    var db = window.openDatabase("test", "1.0", "Test DB", 1000000);
    db.transaction(function (tx) {

        var startTime = new Date();

        console.log('Starting to refresh transactions list ');
        tx.executeSql('SELECT * FROM TRANSACTIONS WHERE paperName = \'' + paperName + '\'', [], function (tx, results) {
            if (results.rows.length > 0) {

                console.log('fetched ' + results.rows.length + ' transactions from db in ' + (new Date() - startTime) + " ms");

                $("#list").empty();

                for (var i = 0; i < results.rows.length; i++) {
                    var transaction = results.rows.item(i);

                    var date = transaction.date.split('-', 3)
                    var formatedDate = date[2].substr(0, 2) + '-' + date[1] + '-' + date[0];

                    $('#list').append(
                        $('<li>').attr('class', 'list-row').append(
                            $('<a>').attr('href', '').attr('class', 'list-link').attr('onclick','return false;').append(
                                $('<span>').append(formatedDate).append(
                                    $('<span>').attr('style', 'float:right').append(transaction.transactionType + ' ' + transaction.numberOfItems + ' for ' + transaction.amount.formatMoney(0, '.', ',') + " " + transaction.currency)
                                ))));

                }
                console.log('Refreshed transactions list data with ' + results.rows.length + ' transactions in ' + (new Date() - startTime) + " ms");

                if (callback != undefined) {
                    callback();
                }
            }
        }, errorCB);
    }, errorCB)
}

function getURLParameters(paramName) {
    var sURL = window.document.URL.toString();
    if (sURL.indexOf("?") > 0) {
        var arrParams = sURL.split("?");
        var arrURLParams = arrParams[1].split("&");
        var arrParamNames = new Array(arrURLParams.length);
        var arrParamValues = new Array(arrURLParams.length);
        var i = 0;
        for (i = 0; i < arrURLParams.length; i++) {
            var sParam = arrURLParams[i].split("=");
            arrParamNames[i] = sParam[0];
            if (sParam[1] != "")
                arrParamValues[i] = unescape(sParam[1]);
            else
                arrParamValues[i] = "No Value";
        }

        for (i = 0; i < arrURLParams.length; i++) {
            if (arrParamNames[i] == paramName) {
                //alert("Param:"+arrParamValues[i]);
                return arrParamValues[i];
            }
        }
        return "No Parameters Found";
    }

}
