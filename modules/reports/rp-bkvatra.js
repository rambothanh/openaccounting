﻿var vatra = require("../../models/vatra");
var dmvat = require("../../models/vat");
var array = require("../../libs/array-funcs");
var async = require("async");
var underscore = require("underscore");
var controller = require("../../controllers/controllerRPT");
module.exports = function(router){
	var rpt = new controller(router,"bkvatra",function(req,callback){
		var condition = req.query;
		if(!condition.tu_ngay || !condition.den_ngay){
			return callback("Báo cáo này cần các tham số sau:id_app,tu_ngay,den_ngay");
		}
		var query = {ngay_ct:{$gte:condition.tu_ngay,$lte:condition.den_ngay}};
		if(condition.ma_dvcs){
			query.ma_dvcs= condition.ma_dvcs;
		}
		var sort ="ngay_hd";
		if(condition.sort){
			sort = condition.sort;
		}
		vatra.find(query).lean().exec(function(error,rows){
			if(error) return callback(error);
			dmvat.find({status:true,id_app:condition.id_app}).sort({ten_thue:1}).lean().exec(function(error,tcs){
				if(error) return callback(error);
				async.map(tcs,function(tc,callback){
					//detail
					var vat_tc1 = underscore.filter(rows,function(r){
						return r.ma_thue == tc.ma_thue;
					});
					vat_tc1 = underscore.sortBy(vat_tc1,function(v){
						return v[sort];
					});
					for(var stt =0;stt < vat_tc1.length;stt++){
						vat_tc1[stt].sysorder = 5;
						vat_tc1[stt].bold = false;
						vat_tc1[stt].stt = stt +1;
						vat_tc1[stt].ten_thue = tc.ten_thue;
					};
					if(vat_tc1.length==0){
						vat_tc1.push({ma_thue:tc.ma_thue,ten_thue:tc.ten_thue,stt:1,sysorder:5,t_tien_nt:0,t_tien:0,t_thue_nt:0,t_thue:0});
					}
					//title
					var title ={ma_thue:tc.ma_thue,ten_thue:tc.ten_thue,stt:tc.ten_thue,sysorder:1,bold:true};
					vat_tc1.push(title);
					//total;
					var t_tien_nt = vat_tc1.csum("t_tien_nt");
					var t_tien = vat_tc1.csum("t_tien");
					var t_thue_nt = vat_tc1.csum("t_thue_nt");
					var t_thue = vat_tc1.csum("t_thue");
					var total = {ma_thue:tc.ma_thue,ten_thue:tc.ten_thue,stt:'Tổng cộng',sysorder:7,bold:true};
					total.t_tien_nt = t_tien_nt;
					total.t_tien = t_tien;
					total.t_thue_nt = t_thue_nt;
					total.t_thue = t_thue;
					vat_tc1.push(total);
					callback(null,vat_tc1);
					
				},function(error,rs){
					
					if(error) return callback(error);
					var report =[];
					rs.forEach(function(rows){
						rows.forEach(function(r){
							report.push(r);
						});
					});
					//
					report = underscore.sortBy(report,function(r){
						return r.ten_thue + r.sysorder.toString() + r.stt.toString();
					});
					//
					callback(null,report);
				});
				
			});
			
			
		});
	});
}