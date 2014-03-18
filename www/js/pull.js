/**
 * Created with IntelliJ IDEA.
 * User: tommysadiqhinrichsen
 * Date: 10/02/14
 * Time: 20.21
 * To change this template use File | Settings | File Templates.
 */
var PULL = function () {
    var content,
        pullToRefresh,
        refreshing,
        contentStartY,
        success,
        start,
        cancel,
        startY,
        track = false,
        refresh = false,
        inTouchMove = false;

    var removeTransition = function () {
        content.style['-webkit-transition-duration'] = 0;
    };

    return {
        init: function (o) {
            content = document.getElementById('content');
            pullToRefresh = document.getElementById('pull_to_refresh');
            refreshing = document.getElementById('refreshing');
            success = o.success;
            start = o.start;
            cancel = o.cancel;

            document.body.addEventListener('touchstart', function (e) {

                contentStartY = parseInt(content.style.top);
                startY = e.touches[0].screenY;
            });

            document.body.addEventListener('touchend', function (e) {

                inTouchMove = false;
                if (refresh) {
                    content.style['-webkit-transition-duration'] = '.5s';
                    content.style.top = '132px';

                    pullToRefresh.style.display = 'none';
                    refreshing.style.display = '';

                    success(function () { // pass down done callback
                        pullToRefresh.style.display = '';
                        refreshing.style.display = 'none';
                        content.style.top = '82px';
                        content.addEventListener('transitionEnd', removeTransition);
                    });

                    refresh = false;
                } else if (track) {
                    content.style['-webkit-transition-duration'] = '.25s';
                    content.style.top = '82px';
                    content.addEventListener('transitionEnd', removeTransition);
                    cancel();
                }

                track = false;
            });

            document.body.addEventListener('touchmove', function (e) {

                if (!inTouchMove) {
                    e.preventDefault();
                    inTouchMove = true;
                }
                var move_to = contentStartY - (startY - e.changedTouches[0].screenY);
                if (move_to > 0) track = true; // start tracking if near the top
                content.style.top = move_to + 'px';

                if (move_to > 132) {
                    refresh = true;
                } else {
                    content.style['-webkit-transition'] = '';
                    refresh = false;
                }
            });
        }
    };
}();


