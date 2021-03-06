var toolBox = require('./toolBox');
var mysql = require('mysql');
const configDB = require('../configDB');

var pool = mysql.createPool(configDB);

var loopFlag = true;
var async = require('async');
var delay = 10000;

exports.start = function () {
    loopFlag = true;
    async.forever(
        function (next) {
            if (!loopFlag) {
                console.log('pushScheduler stopped!');
                return
            }

            console.log('pushScheduler started!');
            pool.getConnection(function (err, connexion) {
                if (err)
                    throw err;
                connexion.query(configDB.query_data, function (err, rows) {
                    if (err)
                        throw err;

                    var item;
                    for (var i = 0; i < rows.length; i++) {
                        var compVal = 0;
                        var msg = '';
                        item = rows[i];

                        compVal = item.lubricant_machine |
                            item.lubricant_saw |
                            item.pressure_air_main |
                            item.pressure_oil_hydraulic |
                            item.servo_cut |
                            item.servo_transfer |
                            item.spindle |
                            item.safety_door |
                            item.depletion;

                        if (compVal) {
                            msg = '['+item.id.toString()+'] ';

                            if (item.lubricant_machine) {
                                msg += '장비 윤활유 부족/'
                            }
                            if (item.lubricant_saw) {
                                msg += '톱날 윤활유 부족/'
                            }
                            if (item.pressure_air_main) {
                                msg += '메인 공기압 부족/'
                            }
                            if (item.pressure_oil_hydraulic) {
                                msg += '윤활유 압력 부족/'
                            }
                            if (item.servo_cut) {
                                msg += '절단 서보 에러/'
                            }
                            if (item.servo_transfer) {
                                msg += '이송 서보 에러/'
                            }
                            if (item.spindle) {
                                msg += '스핀들 이상 에러/'
                            }
                            if (item.safety_door) {
                                msg += '안전 도어 이상/'
                            }
                            if (item.depletion) {
                                msg += '소재 부족/'
                            }
                        }
                        if (compVal){
                            toolBox.broadcastPush(msg)
                        }

                    }
                    connexion.release();
                });
            });


            setTimeout(function () {
                next();
            }, delay)
        },
        function (err) {
            console.error(err);
        }
    )

}

exports.stop = function () {
    loopFlag = false
}