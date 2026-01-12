/**
 * PROJET : EMAIL TRACKER PIXEL
 * Auteur : Fabrice Faucheux
 * Description : Système de suivi d'ouverture d'email via pixel transparent (Web App).
 * Version : 2.0 (ES6 Modern)
 */

/**
 * CONFIGURATION DU SCRIPT
 * @const {string} NOM_FEUILLE_LOGS - Nom de l'onglet de suivi.
 * @const {string} URL_APPLICATION_WEB - URL fournie lors du déploiement (À METTRE À JOUR APRÈS DÉPLOIEMENT).
 * @const {number} DELAI_IGNORER_SECONDES - Délai anti-auto-ouverture (en secondes).
 */
const NOM_FEUILLE_LOGS = "Logs";
// IMPORTANT : Remplacez ceci par l'URL obtenue après : Déployer > Nouveau déploiement
const URL_APPLICATION_WEB = "https://script.google.com/macros/s/VOTRE_ID_DEPLOIEMENT/exec"; 
const DELAI_IGNORER_SECONDES = 60;

/**
 * Crée le menu personnalisé à l'ouverture du fichier Spreadsheet.
 */
const onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 Tracker Email')
      .addItem('Envoyer le dernier brouillon', 'envoyerDernierBrouillon')
      .addSeparator()
      .addItem('Initialiser la feuille', 'initialiserFeuille')
      .addToUi();
};

/**
 * Initialise ou répare l'onglet de logs avec les entêtes appropriés.
 */
const initialiserFeuille = () => {
  try {
    const classeur = SpreadsheetApp.getActiveSpreadsheet();
    let feuille = classeur.getSheetByName(NOM_FEUILLE_LOGS);

    // Création de la feuille si elle n'existe pas
    if (!feuille) {
      feuille = classeur.insertSheet(NOM_FEUILLE_LOGS);
    }

    // Configuration des entêtes
    const entetes = [["ID Unique", "Destinataire", "Sujet", "Date Envoi", "Dernière Ouverture"]];
    const plageEntetes = feuille.getRange("A1:E1");
    
    plageEntetes.setValues(entetes);
    plageEntetes.setFontWeight("bold");
    feuille.setFrozenRows(1);
    
    // Formatage des colonnes Date (D et E)
    const maxLignes = feuille.getMaxRows();
    if (maxLignes > 1) {
      feuille.getRange(2, 4, maxLignes - 1, 2).setNumberFormat("dd/MM/yyyy HH:mm:ss");
    }
    
    console.log("Feuille initialisée avec formatage d'horodatage complet.");
    SpreadsheetApp.getUi().alert("Succès : La feuille est prête et formatée.");

  } catch (erreur) {
    console.error(`Erreur lors de l'initialisation : ${erreur.message}`);
    SpreadsheetApp.getUi().alert(`Erreur : ${erreur.message}`);
  }
};

/**
 * Web App : Point d'entrée pour le pixel de tracking.
 * Gère la concurrence avec LockService pour éviter les conflits d'écriture.
 * @param {Object} e - L'objet événement contenant les paramètres de la requête.
 * @return {TextOutput} Une réponse vide pour ne pas briser l'affichage de l'image.
 */
const doGet = (e) => {
  const verrou = LockService.getScriptLock();
  
  // Tente de verrouiller le script pendant 10 secondes pour éviter les conflits
  if (verrou.tryLock(10000)) {
    try {
      const idRecherche = e.parameter.id;
      
      if (idRecherche) {
        const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOM_FEUILLE_LOGS);
        // Lecture en lot pour la performance
        const donnees = feuille.getDataRange().getValues();
        
        // Recherche de l'index de la ligne correspondant à l'ID (colonne A / index 0)
        const indexLigne = donnees.findIndex(ligne => ligne[0] === idRecherche);

        if (indexLigne > 0) { // Si trouvé et n'est pas l'entête
          const dateEnvoi = new Date(donnees[indexLigne][3]);
          const maintenant = new Date();
          
          // Calcul de la différence en secondes
          const diffSecondes = (maintenant.getTime() - dateEnvoi.getTime()) / 1000;

          // Filtre anti-auto-ouverture
          if (diffSecondes > DELAI_IGNORER_SECONDES) {
            // Mise à jour de la colonne "Dernière Ouverture" (Colonne E -> index 5 en notation A1, mais offset 4 en array)
            // getRange(row, column) => row est 1-based. indexLigne est 0-based.
            feuille.getRange(indexLigne + 1, 5).setValue(maintenant);
          }
        }
      }
    } catch (erreur) {
      console.error(`Erreur WebApp : ${erreur.message}`);
    } finally {
      verrou.releaseLock();
    }
  }

  // Retourne une réponse texte compatible JS pour ne pas générer d'erreur 404 dans le client mail
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.JAVASCRIPT); 
};

/**
 * Récupère le brouillon Gmail le plus récent, insère le pixel et l'envoie.
 */
const envoyerDernierBrouillon = () => {
  const ui = SpreadsheetApp.getUi();
  
  // 1. Validation de la configuration
  if (!URL_APPLICATION_WEB.includes("script.google.com") || URL_APPLICATION_WEB.includes("VOTRE_ID")) {
    ui.alert("Configuration Requise", "Veuillez déployer ce script en tant qu'application Web et coller l'URL dans la variable 'URL_APPLICATION_WEB' du script.", ui.ButtonSet.OK);
    return;
  }

  try {
    // 2. Récupération des brouillons
    const brouillons = GmailApp.getDrafts();
    if (brouillons.length === 0) {
      ui.alert("Information", "Aucun brouillon trouvé dans votre boîte Gmail.", ui.ButtonSet.OK);
      return;
    }

    // Déstructuration pour prendre le premier élément
    const [dernierBrouillon] = brouillons;
    const message = dernierBrouillon.getMessage();
    
    const destinataire = message.getTo();
    const sujet = message.getSubject();
    const corpsHtml = message.getBody();

    // 3. Confirmation utilisateur
    const reponse = ui.alert(
      'Confirmer l\'envoi', 
      `Voulez-vous envoyer et tracker le brouillon suivant ?\n\nSujet : ${sujet}\nDestinataire : ${destinataire}`, 
      ui.ButtonSet.YES_NO
    );

    if (reponse === ui.Button.YES) {
      // 4. Création du Tracker
      const idUnique = Utilities.getUuid();
      const urlPixel = `${URL_APPLICATION_WEB}?id=${idUnique}`;
      
      // Insertion d'une balise image invisible. 
      // Note: width/height à 1 et display:none aident à la discrétion.
      const baliseImage = `<img src="${urlPixel}" width="1" height="1" style="display:none;" alt="" />`;
      
      const corpsFinal = `${corpsHtml}<br>${baliseImage}`;

      // 5. Envoi de l'email via GmailApp
      GmailApp.sendEmail(destinataire, sujet, "", {
        htmlBody: corpsFinal,
        cc: message.getCc(),
        bcc: message.getBcc(),
        attachments: message.getAttachments()
      });

      // 6. Nettoyage et Log
      dernierBrouillon.deleteDraft();
      
      const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOM_FEUILLE_LOGS);
      feuille.appendRow([idUnique, destinataire, sujet, new Date(), "En attente..."]);

      ui.alert("Succès", "L'email a été envoyé et le tracking est activé.", ui.ButtonSet.OK);
    }

  } catch (erreur) {
    console.error(`Erreur lors de l'envoi : ${erreur.message}`);
    ui.alert("Erreur Critique", `Une erreur est survenue : ${erreur.message}`, ui.ButtonSet.OK);
  }
};
