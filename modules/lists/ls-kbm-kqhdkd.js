var model = require("../../models/kbm_kqhdkd");
var controller = require("../../controllers/controller");
module.exports = function(router){
	var contr = new controller(router,model,'kbmkqhdkd',{
		sort:{stt:1,ma_so:1},
		unique:['ma_so']
	});
	contr.route();
}