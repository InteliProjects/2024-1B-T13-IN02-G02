if (document.getElementById('report-button-open')) {
    document.getElementById('report-button-open').addEventListener('click', function() {
        document.getElementById('report-modal').classList.remove('hidden')
    });
    document.getElementById('report-button-close').addEventListener('click', function() {
        document.getElementById('report-modal').classList.add('hidden')
    });
}
