document.getElementById('btn').onclick = function() {
    Dialog.Confirm('This is an confirming dialog.', function() {
            console.log('You choose 1.');
        }, function() {
            console.log('You choose 0.');
        }, {
            sureText: 'ok',
            cancelText: 'cancel'
        }
    );
};
