const express = require('express');
const { getCVDMonitoringSuom } = require('./controller');

const router = express.Router();

router.route('/getCVDMonitoringSuom').get(getCVDMonitoringSuom);

module.exports = router;
