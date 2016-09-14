document.getElementById('btn1').onclick = function() {
    Dialog.Alert('This is an alerting dialog.', {
        btnText: 'great'
        // , callback: function() { console.log('alerting dialog closed'); }
    });
};

document.getElementById('btn2').onclick = function() {
    Dialog.Alert('This is an alerting dialog.', {
        time: 1,
        noBlock: 1
    });
};
