sap.ui.define([
	'jquery.sap.global',
	'sap/m/MessageBox',
	'com/billing/statusbillingStatus/controller/Formatter',
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function(jQuery, MessageBox, Formatter, Controller, Export, ExportTypeCSV, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("com.billing.statusbillingStatus.controller.main", {
        
        formatter: Formatter,
        
		onInit: function() {
			//Declare Format for the total sum Number in the footer
			jQuery.sap.require("sap.ui.model.type.DateTime"); 
			jQuery.sap.require("sap.ui.core.format.NumberFormat");
			this.control = false;
			this.numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
			});
			
			//Set tool tip message to show when mouse is on hover item
			this.setToolTips();
			//Declare icons global variables objects
			//this.normalButton = this.getView().byId("normalIcon");
			//this.specialButton = this.getView().byId("specialIcon");
			this.clearedButton = this.getView().byId("clearedIcon");
			this.openButton = this.getView().byId("openIcon");
			//this.dateButton = this.getView().byId("dateIcon");
			this.downloadButton = this.getView().byId("downloadIcon");
			this.clearButton = this.getView().byId("clearIcon");
			
			//Declare booleans to check wich filter is selected
			this.isCleared = false;
			this.isOpen = false;
			//this.isDate = false;
			this.isNormal = false;
			this.isSpecial = false;
		
			//Declare global Filter
			this.filters = [];
			this.IsClearedFilter = new sap.ui.model.Filter("IsCleared", sap.ui.model.FilterOperator.EQ, "X");
			this.IsOpenFilter = new sap.ui.model.Filter("IsCleared", sap.ui.model.FilterOperator.NE, "X");
			this.defaultFilter = new sap.ui.model.Filter("SpecialGeneralLedgerCode", sap.ui.model.FilterOperator.EQ, "A" );
			this.defaultFilter2 = new sap.ui.model.Filter("SpecialGeneralLedgerCode", sap.ui.model.FilterOperator.EQ, "F" );
			this.IsNormalFilter = new sap.ui.model.Filter("DueItemCategory", sap.ui.model.FilterOperator.EQ, "N");
			this.IsSpecialFilter = new sap.ui.model.Filter("DueItemCategory", sap.ui.model.FilterOperator.EQ, "S");
			this.defaultFilter3 = new sap.ui.model.Filter("DueItemCategory", sap.ui.model.FilterOperator.NE, "M");
			
			//declare global Object
			this.table = this.getView().byId("creditListItem");
			
			this.oModelId = new sap.ui.model.json.JSONModel();
			this.oModelCredit = new sap.ui.model.json.JSONModel();
			this.oModelId.loadData("/sap/opu/odata/sap/ZSDGW_SO_CREATE_SRV_01/CustomerSet('')");
			this.totalAccount = this.getView().byId("totalAccount");
			var that = this;
			this.oModelId.attachRequestCompleted(function() {
				that.showBusyIndicator(6000, 0);
				that.BillTo = that.oModelId.getProperty("/d/BillTo");
				that.PartnerFunc = that.oModelId.getProperty("/d/PartnerFunc");
				that.oModelCredit.loadData("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items?$filter=Customer eq '" + that.BillTo + "'");// and (DueItemCategory eq 'N' or DueItemCategory eq 'S')");
				that.getView().setModel(that.oModelCredit);
				//that.table.setModel(that.oModelCredit);
				var underThat = that;
				that.oModelCredit.attachRequestCompleted(function() {
					underThat.getDates();
					//underThat.getTotal();
					underThat.reAssignFilters();
				});

			});
		},
		
		
		getDates:function(){
			var oModel = this.table.getModel();
			var aItems = this.table.getItems();
			var date = 0;
			var newDateDocument ;
			var newNetDueDate ;
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy"
			});
			
			var today =  oDateFormat.format(new Date());
			
			var dueFlagY = false;
			var dueFlagD = false;
			var dueFlagM = false;
			
			var auxDate = 0.23;
			var IsCleared;
			
		    for (var i=0; i<aItems.length; i++){
              //console.log("Fechas");
			  date = oModel.getProperty("DocumentDate",aItems[i].getBindingContext());
			  newDateDocument = new Date(date.match(/\d+/)[0] * 1);
			  newDateDocument.setDate(newDateDocument.getDate() + +auxDate);
			  newDateDocument = oDateFormat.format(newDateDocument);
			  oModel.setProperty("/d/results/" + i + "/DocumentDate", newDateDocument);
			  //console.log("cambio 1 fechas");
			  
			  date = oModel.getProperty("NetDueDate",aItems[i].getBindingContext());
			  newNetDueDate = new Date(date.match(/\d+/)[0] * 1);
			  newNetDueDate.setDate(newNetDueDate.getDate() + +auxDate);
			 /* IsCleared = oModel.getProperty("IsCleared",aItems[i].getBindingContext());
			  if (IsCleared === "X"){
			  	oModel.setProperty("/d/results/" + i + "/NetPaymentDays", "");
			  } else {
			  	//console.log("cambio 2 fechas");
				  var startDate = newNetDueDate;
				  var endDate = new Date();  
				  //console.log("Declara las fechas");
				  var diff = Math.abs(endDate.getTime() - startDate.getTime());
				  //console.log("diff:" + diff);
				  console.log("AccountingDocument: " + oModel.getProperty("AccountingDocument",aItems[i].getBindingContext()));
				  var diffD = Math.ceil(diff / (1000 * 60 * 60 * 24)); 
				  console.log(startDate.getTime());
				  console.log("diffD: " + diffD);
				  oModel.setProperty("/d/results/" + i + "/NetPaymentDays", diffD);
				 // newNetDueDate = endDate.setDate(endDate.getDate() - +diffD);
				 // console.log("Fecha:" + newNetDueDate);
			  }*/
			  newNetDueDate = oDateFormat.format(newNetDueDate);
			  oModel.setProperty("/d/results/" + i + "/NetDueDate", newNetDueDate);
			}
		},
		
		getTotal: function () {
			var oModel = this.table.getModel();
			var aItems = this.table.getItems();
			var total = 0;
			var amount = 0;
			if (!this.isCleared){
			   for (var i=0; i<aItems.length; i++){
				  amount = oModel.getProperty("AmountInTransactionCurrency",aItems[i].getBindingContext());
				  if (oModel.getProperty("DueItemCategory",aItems[i].getBindingContext()) !== "M"){
					total = total + +amount;
				  }
				}
			} 
			var totalFormatted = this.numberFormat.format(total) + " " +"MXN";
			
			this.totalAccount.setProperty("text", totalFormatted);
			
		},
		
		getTotalPayed: function (){
			return this.payed;
		},
		
		
		hideBusyIndicator: function() {
			jQuery.sap.require("sap.ui.core.BusyIndicator");
			sap.ui.core.BusyIndicator.hide();
		},

		showBusyIndicator: function(iDuration, iDelay) {
			jQuery.sap.require("sap.ui.core.BusyIndicator");
			sap.ui.core.BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					jQuery.sap.clearDelayedCall(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = jQuery.sap.delayedCall(iDuration, this, function() {
					this.hideBusyIndicator();
				});
			}
		},
		
	
		
		reAssignFilters: function (){
		  this.filters = [];
		  if (this.isCleared){
		   	 this.filters.push(this.IsClearedFilter);
		   }
		   else {
		   	this.filters.push(this.IsOpenFilter);
		   }
		   //this.filters.push(this.defaultFilter);
		   //this.filters.push(this.defaultFilter2);
		   //this.filters.push(this.defaultFilter3);
		   //this.filters.push(this.IsSpecialFilter);
		   //this.filters.push(this.IsNormalFilter);
		   
		   this.table.getBinding("items").filter(this.filters);
		   this.getTotal(); 
		   this.table.getModel().refresh(true);
		   
		},
		
		onCleared: function (){
		  if (this.clearedButton.getType() === "Default"){
		  	this.isCleared = true;
			this.clearedButton.setType("Emphasized");
			this.openButton.setType("Default");
		  } 
		   this.reAssignFilters();
		},
		
		/*	
		onNormal: function (){
		  if (this.normalButton.getType() === "Default"){
		  	this.isNormal = true;
			this.normalButton.setType("Emphasized");
		  } else {
		  	this.isNormal = false;
			this.normalButton.setType("Default");
		  } 
		  
		   this.reAssignFilters();
		},
	
		onSpecial: function (){
		  if (this.specialButton.getType() === "Default"){
		  	this.isSpecial = true;
			this.specialButton.setType("Emphasized");
		  } else {
		  	this.isSpecial = false;
			this.specialButton.setType("Default");
		  } 
		  
		   this.reAssignFilters();
		},
		*/
		onOpen: function (){
		  if (this.openButton.getType() === "Default"){
		  	this.isCleared = false;
			this.openButton.setType("Emphasized");
			this.clearedButton.setType("Default");
		  } 
		   this.reAssignFilters();
		},
		
		onClearFilters: function() {
			this.isCleared = false;
			this.isOpen = false;
			this.openButton.setType("Default");
			this.clearedButton.setType("Default");
			this.reAssignFilters();
		},
		
	    dayLogic:function (date) {
	    	//console.log("Fecha:" + date);
	    },
		
		initSorter: function(){
			return new sap.ui.model.Sorter("DocumentDate", true);
		},
		
		handleChange: function (oEvent) {
			var oDP = oEvent.oSource;
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
		},
		
		onDate: function () {
			var oView = this.getView();
			var oDialog = oView.byId("dateDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "com.credit.report_CreditReport.view.dateFilter");
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		
		dialogContent : function () {
			return  new Text({ text: '¨seleccione la fecha' });
		},
		
		
		setToolTips: function(){
			//this.getView().byId("normalIcon").setTooltip("Partidas normales");	
			//this.getView().byId("specialIcon").setTooltip("Partidas Speciales");	
			this.getView().byId("clearedIcon").setTooltip("Filtar por Cerradas");	
			this.getView().byId("openIcon").setTooltip("Filtrar por Abiertas");
			//this.getView().byId("dateIcon").setTooltip("Filtar por fecha");	
			this.getView().byId("downloadIcon").setTooltip("Descargar Todo");
			//this.getView().byId("clearIcon").setTooltip("Limpiar Filtros");
		},
		
		//Icons behaiviour
			specialGl: function (Special) {
			if (Special === "A") {
				return "sap-icon://sys-enter";
			}
			if (Special === "F") {
				return "sap-icon://letter";
			}
		},
		
		iconColorSpecial: function (Special) {
			if (Special === "A") {
				return "Success";
			}
			if (Special === "F") {
				return "Warning";
			}
		},
		
		dueNetStatus: function(Status) {
		    if (Status === "") {
		        return "sap-icon://sys-enter";
		    }  
		    if(Status === "2"){
		        return "sap-icon://alert";
		    }
		    if(Status === "3"){
		        return "sap-icon://time-overtime";
		    }
		},
		
		specialGlText: function(Status){
			if (Status === "A") {
				return "Pagado";
			}
			if (Status === "F") {
				return "Pendiente";
			}
			
		},
		
		isClearedOrNot: function (Status){
			if (Status === "X") {
				return "sap-icon://status-positive";
			} else {
				return "sap-icon://status-error";
			}	
		},
		
		iconIsClearedOrNot: function (Status){
			if (Status === "X") {
				return "Success";
			} else {
				return "Error";
			}	
		},
		
		iconColor: function(State) {
		    if (State === "") {
		        return "Success";
		    }  
		    if(State === "2"){
		        return "Warning";
		    }
		    if(State === "3"){
		        return "Error";
		    }
		},
		
		onDataExport: sap.m.Table.prototype.exportData || function(oEvent) {

			var column1 =  this.getView().getModel("i18n").getResourceBundle().getText("label1");
			var column2 = this.getView().getModel("i18n").getResourceBundle().getText("label2");
			var column3 = this.getView().getModel("i18n").getResourceBundle().getText("label3");
			var column4 = this.getView().getModel("i18n").getResourceBundle().getText("label4");
			var column5 = this.getView().getModel("i18n").getResourceBundle().getText("label5");
			var column6 = this.getView().getModel("i18n").getResourceBundle().getText("label6");
			var column7 = this.getView().getModel("i18n").getResourceBundle().getText("label7");

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ","
				}),

				// Pass in the model created above
				models: this.getView().getModel(),

				// binding information for the rows aggregation
				rows: {
					path: "/d/results"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: "Número de Factura",
					template: {
						content: "{BillingDocument}"
					}
				}, {
					name: "Fecha de Factura",
					template: {
						content: "{DocumentDate}"
					}
				}, {
					name: "Anticipo",
					template: {
						content: "{SpecialGeneralLedgerCode}"
					}
				}, {
					name: "Fecha de Vencimiento",
					template: {
						content: "{NetDueDate}"
					}
				}, {
					name: "Días vencido",
					template: {
						content: "{NetDueArrearsDays}"
					}
				}, {
					name: "Importe MXN",
					template: {
						content: "{AmountInTransactionCurrency} {TransactionCurrency}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});

		}

	});

});