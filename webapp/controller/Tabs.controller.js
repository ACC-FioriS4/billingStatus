sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.billing.statusbillingStatus.controller.Tabs", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.billing.statusbillingStatus.view.Tabs
		 */
		onInit: function() {

			this.oModelId = new sap.ui.model.json.JSONModel();
			this.oModelCredit = new sap.ui.model.json.JSONModel();
			this.oModelId.loadData("/sap/opu/odata/sap/ZSDGW_SO_CREATE_SRV_01/CustomerSet('')");

			var that = this;
			this.oModelId.attachRequestCompleted(function() {
				that.BillTo = that.oModelId.getProperty("/d/BillTo");
				that.PartnerFunc = that.oModelId.getProperty("/d/PartnerFunc");
				that.oModelCredit.loadData("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items?$filter=Customer eq '" + that.BillTo + "'"); // and (DueItemCategory eq 'N' or DueItemCategory eq 'S')");
				that.getView().setModel(that.oModelCredit);
				//that.table.setModel(that.oModelCredit);
				var underThat = that;
				that.oModelCredit.attachRequestCompleted(function() {
					underThat.getCounts(underThat.oModelCredit.getData());
				});

			});

		},

		getCounts: function(data) {
			this.payed = 0;
			this.toPay = 0;
			this.dues = 0;
			
		//	console.log(data);
            
            //this.title = data.d.results[0].CustomerName;
            
			for (var i = 0; i < data.d.results.length; i++) {

				if (data.d.results[i].IsCleared === "X") {
					this.payed = this.payed + 1;
				} else {
					if (data.d.results[i].NetDueArrearsDays <= 0) {
						this.toPay = this.toPay + 1;
					} else {
						this.dues = this.dues + 1;
					}
				}
			}
			
			//this.getView().byId("title").setProperty("text", this.title);
			this.getView().byId("payed").setProperty("count", this.payed);
			this.getView().byId("toPay").setProperty("count", this.toPay);
			this.getView().byId("dues").setProperty("count", this.dues);
			

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.billing.statusbillingStatus.view.Tabs
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.billing.statusbillingStatus.view.Tabs
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.billing.statusbillingStatus.view.Tabs
		 */
		//	onExit: function() {
		//
		//	}

	});

});