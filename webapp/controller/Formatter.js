sap.ui.define([], function() {

	"use strict";
	
	return {
		
		dayLogic: function(days){
			var d=0;
			if (days<0){
				d = days * -1;
			    return d + " para vencer";
			} 
			if (days>0){
				return days + " vencido";
			}
			
			if (days===0){
				return "Por Vencer";
			}
		}
		
	};

});