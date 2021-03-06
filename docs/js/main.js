import * as Database from './modules/Database.js';
import * as TaskJS from './modules/Task.js';
import * as DisplayJS from './modules/Display.js';
import * as DateJS from './modules/Date.js';

console.log('Connexion √† js √©tablie');

// =======  Variables globales  ======= //
var externalList = "";
 
const tableToDoList = document.getElementById("tableToDoList");
const tasksTable = document.getElementById("tasksTable");

const openTasksSortBtn = document.getElementById("openTasksSortBtn");
const closedTasksSortBtn = document.getElementById("closedTasksSortBtn");
const allTasksSortBtn = document.getElementById("allTasksSortBtn");

// const domainField = document.getElementById("input-tk-domain");

const domainField = document.getElementById("domainOptions");
const statusField = document.getElementById("input-tk-status");
const progressField = document.getElementById("input-tk-progress");

const domainFieldUpdate = document.getElementById("input-upd-tk-domain");
const statusFieldUpdate = document.getElementById("input-upd-tk-status");
const progressFieldUpdate = document.getElementById("input-upd-tk-progress");

// ======= A VOIR ======= //
function printError(event) {
	console.log("Erreur : "+event.target.errorCode);
}

function jsonStringToArray(jsonString) {
	var prepList = (jsonString).replace(/(\r\n|\n|\r)/gm, " ");
	var itemArray = JSON.parse(prepList);
	return itemArray;	
}
// ======= A VOIR - FIN ======= //


// =======  Import - Gestion asynchronicit√©  ======= //

function fileImportPromise(importedFile) {
	const extListReader = new FileReader();
	return new Promise((resolve,reject) => {

		extListReader.onload = () => {
 	    	externalList = extListReader.result;

 	    	resolve(extListReader.result);
 	    };
 
		extListReader.onerror = () => {
	      extListReader.abort();
 	      reject(new DOMException("Problem parsing input file."));
 	    };

		extListReader.readAsText(importedFile);
	});
}

async function handleUpload(event){
	const selectedFile = document.getElementById('taskExtListFile').files[0];

	if (TaskJS.testCSVtype(selectedFile)) { 
		//try {
			const fileContents = await fileImportPromise(selectedFile);
			DisplayJS.resetDisplay();

			TaskJS.csvToArrayOfObjects(externalList);
			Database.useDB("print");
			// document.getElementById("hideTaskList").innerHTML = "Cacher la liste";
			var infoImportSuccess = "Seules les t√Ęches en cours sont affich√©es <br> Cliquer sur 'Voir toutes les t√Ęches' pour toutes les afficher";
			DisplayJS.showInfoModal("Import du fichier CSV r√©ussi",infoImportSuccess);
			

			//DisplayJS.showElement(tasksTable);
						
		//} 
		//catch (e) {
	 	//    console.log(e.message);
	 	// }
	}
	else {
			DisplayJS.showInfoModal("Format incorrect","Le fichier s√©lectionn√© n'est pas au bon format (.csv)");	
			//clearForm('addFileList');
	}
}
// =======  Import - Gestion asynchronicit√© - FIN ======= //


// ======= Initialisation ======= //

// Intialiser les affichages et eventListener
function pageSetup(){
	DisplayJS.setDefaultTaskTableDisplay();

	// Gestion de la mise en m√©moire du num√©ro de la prochaine t√Ęche
	var storedId = window.localStorage.getItem("latestUsedIdTask");

	//console.log(storedId);
	
	var latestUsedIdIntTask = ((storedId == null) || (storedId.localeCompare("undefined") == 0)) ? 0 : parseInt(storedId);
	window.localStorage.setItem("latestUsedIdTask", latestUsedIdIntTask);

	// Rafra√ģchissement de la variable apr√®s mise √† jour dans localStorage
	storedId = window.localStorage.getItem("latestUsedIdTask");

	// Activation du bouton Cr√©er et d√©sactivation des autres boutons sauf import

	if (storedId == 0) {
		DisplayJS.deactivateTaskMnt();
		document.getElementById('currentDisplayText').innerHTML = "il n'y a pas de t√Ęches list√©es pour l'instant";
	}
	else {
		DisplayJS.activateTaskMnt();
		Database.useDB("print");
		
	}
		
	// Ajout des eventListener
		
	// Bouton "Ajouter une t√Ęche"
	document.getElementById("addToDoListItem").addEventListener("click",function(){
				
		var latestUsedIdTask = parseInt(window.localStorage.getItem("latestUsedIdTask"));
		document.getElementById("generatedId").innerHTML = parseInt(latestUsedIdTask + 1);
		DisplayJS.showElement(document.getElementById("formAddTaskDiv"));
	});
	
	// Bouton "Ajouter" dans la zone d'ajout
	document.getElementById("submitBtnAdd").addEventListener("click", function () {
		var testTasktext = document.getElementById("input-tk-text").value.localeCompare("") == 0;
		var testTaskDeadline = document.getElementById("input-tk-deadline").value.localeCompare("") == 0;
		console.log(document.getElementById("input-tk-text").value+" - "+typeof(document.getElementById("input-tk-text").value));
		console.log(document.getElementById("input-tk-deadline").value+" - "+typeof(document.getElementById("input-tk-deadline").value));
		console.log(testTasktext);
		console.log(testTaskDeadline);
		if (testTasktext || testTaskDeadline) {
			DisplayJS.showInfoModal("Cr√©ation / Modification d'une t√Ęche","Les champs '√Čch√©ance' et 'T√Ęche' sont obligatoires");
		}
		else {
			TaskJS.createTaskFromAddForm();
		}
	});
	
	// Bouton "Modifier" dans la zone de modification
	document.getElementById("submitBtnUpdate").addEventListener("click", TaskJS.updateTaskData);

	// Bouton "Effacer les donn√©es"
	document.getElementById('cleartaskObjSt').addEventListener('click', function(){
		try {	
			if(confirm("Voulez-vous effacer cette liste ?\nLe contenu ne pourra pas √™tre r√©cup√©r√©.")) {
				Database.useDB("delete_objSt");
				DisplayJS.resetDisplay();
				window.localStorage.setItem("latestUsedIdTask","0");
				
				DisplayJS.showInfoModal("Effacement des donn√©es","Les donn√©es ont √©t√© effac√©es");
				
			}
			else {
				DisplayJS.showInfoModal("Effacement des donn√©es","Les donn√©es n'ont pas √©t√© effac√©es");
			}

		} 
		catch (e){
			console.log("Effacement des donn√©es - √Čchec : "+e.message);
		}
	
	});

	// Bouton "Voir les t√Ęches en cours"
	document.getElementById("showOpenToDoListItem").addEventListener("click", function(){
			DisplayJS.resetDisplay();
  			Database.useDB("print",undefined,undefined,"open",undefined);
	});
	
	// Bouton "Voir les t√Ęches ferm√©es"
	document.getElementById("showClosedToDoListItem").addEventListener("click", function(){
			DisplayJS.resetDisplay();
  			Database.useDB("print",undefined,undefined,"closed",undefined);
	});

	// Bouton "Classer les t√Ęches en cours par √©ch√©ance"
	document.getElementById("showOpenToDoListItemByDeadline").addEventListener("click", function() {
			DisplayJS.resetDisplay();
  			Database.useDB("print",undefined,undefined,"open","by_deadline");
	})
	

	// Bouton "Afficher toutes les t√Ęches"
	document.getElementById("showAllToDoListItem").addEventListener("click", function(){
			DisplayJS.resetDisplay();	
  			Database.useDB("print");
	});
	// Bouton "Importer depuis un fichier CSV"
	document.querySelector('input#taskExtListFile').addEventListener('change', handleUpload);


	// Bouton "Cr√©er une liste"
	document.getElementById('createListBtn').addEventListener('click', function() {
		Database.useDB("create");
		//DisplayJS.showElement(tasksTable);
	});

	// Bouton "Cacher la zone de modification"
	document.getElementById("hideFormUpdateTaskDiv").addEventListener('click', function() {DisplayJS.hideElement(document.getElementById("formUpdateTaskDiv"));});		

	// Bouton "Cacher la zone de modification"
	document.getElementById("hideFormAddTaskDiv").addEventListener('click', function() {DisplayJS.hideElement(document.getElementById("formAddTaskDiv"));});	


	// Bouton "Exporter la liste"
	document.getElementById("exportList").addEventListener("click",function(){Database.useDB("export");});

	// Bouton Fermer de la modale (croix)
	document.getElementById("modalCloseBtn").addEventListener("click", DisplayJS.hideModal);

	// Bouton "Annuler" de la modale
	document.getElementById("modalCancelBtn").addEventListener("click", DisplayJS.hideModal);

	// Ajout des eventListener - FIN


	// ==== Liste d√©roulante - G√©n√©ration auto === //

	DisplayJS.htmlDomainFields(domainField);
	DisplayJS.htmlStatusFields(statusField); 
	DisplayJS.htmlProgressFields(progressField);

	DisplayJS.htmlDomainFields(domainFieldUpdate);
	DisplayJS.htmlStatusFields(statusFieldUpdate); 
	DisplayJS.htmlProgressFields(progressFieldUpdate);

	// ==== Liste d√©roulante - G√©n√©ration auto - FIN === //

	DateJS.printDayInfo();
}

// ======= Initialisation - FIN ======= //

window.onload = pageSetup();
// V√©rification de la compatibilit√© du navigateur
if (!window.indexedDB) {
   var browserIDBWarning = "Votre navigateur ne supporte pas une version stable d'IndexedDB. <br> Des fonctionnalit√©s essentielles ne seront pas disponibles."
	DisplayJS.showInfoModal("Navigateur non adapt√©",browserIDBWarning);
	} 
else {
	console.log("IndexedDB OK !");
	}


