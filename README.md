# 📧 Google Sheets Email Tracker

![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-green)
![Runtime](https://img.shields.io/badge/Google%20Apps%20Script-V8-green)
![Author](https://img.shields.io/badge/Auteur-Fabrice%20Faucheux-orange)

**[FR]** Un système léger et efficace pour suivre l'ouverture des emails envoyés via Gmail depuis Google Sheets, utilisant un pixel de tracking invisible.  
**[EN]** A lightweight and efficient system to track email opens sent via Gmail from Google Sheets using an invisible tracking pixel.

---

## 🇫🇷 DOCUMENTATION FRANÇAISE

### Fonctionnalités
* **Envoi Automatisé :** Récupère le dernier brouillon Gmail.
* **Injection de Pixel :** Insère automatiquement une image 1x1 transparente unique.
* **Suivi en Temps Réel :** Enregistre la date et l'heure d'ouverture dans Google Sheets.
* **Anti-Faux Positifs :** Ignore les ouvertures immédiates (ex: ouverture par l'expéditeur).

### 🚀 Installation et Configuration

#### 1. Préparation du Script
1.  Ouvrez votre Google Sheet.
2.  Allez dans `Extensions` > `Apps Script`.
3.  Copiez le code fourni dans le fichier `Code.gs`.
4.  Sauvegardez (`Ctrl + S`).

#### 2. Déploiement de l'Application Web (CRITIQUE)
C'est l'étape la plus importante pour que le tracking fonctionne.

1.  En haut à droite de l'éditeur, cliquez sur le bouton bleu **Déployer**.
2.  Sélectionnez **Nouveau déploiement**.
3.  Cliquez sur la roue dentée (Paramètres) à gauche de la fenêtre pop-up et choisissez **Application Web**.
4.  Remplissez les champs suivants **exactement** comme indiqué :
    * **Description :** `Tracker v1` (ou ce que vous voulez).
    * **Exécuter en tant que :** `Moi` (votre adresse email).
    * **Qui peut accéder :** `N'importe qui` (ou `Anyone` en anglais).
    * *Note : Si vous ne mettez pas "N'importe qui", le pixel ne chargera pas chez vos destinataires.*
5.  Cliquez sur **Déployer**.
6.  Copiez l'**URL de l'application Web** (elle commence par `https://script.google.com/macros/s/...`).

#### 3. Finalisation
1.  Retournez dans le code (`Code.gs`).
2.  Collez l'URL copiée dans la variable `URL_APPLICATION_WEB` à la ligne 12 :
    ```javascript
    const URL_APPLICATION_WEB = "[https://script.google.com/macros/s/XXX-VOTRE-URL-XXX/exec](https://script.google.com/macros/s/XXX-VOTRE-URL-XXX/exec)";
    ```
3.  Sauvegardez à nouveau.
4.  Rechargez votre Google Sheet. Un menu **📧 Tracker Email** apparaîtra.
5.  Lancez `Initialiser la feuille` pour créer l'onglet de logs.

---

## 🇬🇧 ENGLISH DOCUMENTATION

### Features
* **Automated Sending:** Fetches the latest Gmail draft.
* **Pixel Injection:** Automatically inserts a unique 1x1 transparent image.
* **Real-time Tracking:** Logs the opening date and time in Google Sheets.
* **Anti-False Positive:** Ignores immediate opens (e.g., opened by sender).

### 🚀 Installation and Setup

#### 1. Script Preparation
1.  Open your Google Sheet.
2.  Go to `Extensions` > `Apps Script`.
3.  Copy the provided code into `Code.gs`.
4.  Save (`Ctrl + S`).

#### 2. Web App Deployment (CRITICAL)
This is the most important step for the tracking to work.

1.  At the top right of the editor, click the blue **Deploy** button.
2.  Select **New deployment**.
3.  Click the gear icon (Settings) on the left of the pop-up and choose **Web app**.
4.  Fill in the fields **exactly** as follows:
    * **Description:** `Tracker v1`.
    * **Execute as:** `Me` (your email address).
    * **Who has access:** `Anyone`.
    * *Note: If you do not select "Anyone", the pixel will fail to load for your recipients.*
5.  Click **Deploy**.
6.  Copy the **Web app URL** (starts with `https://script.google.com/macros/s/...`).

#### 3. Finalizing
1.  Go back to the code (`Code.gs`).
2.  Paste the copied URL into the `URL_APPLICATION_WEB` variable at line 12:
    ```javascript
    const URL_APPLICATION_WEB = "[https://script.google.com/macros/s/XXX-YOUR-URL-XXX/exec](https://script.google.com/macros/s/XXX-YOUR-URL-XXX/exec)";
    ```
3.  Save again.
4.  Reload your Google Sheet. A menu **📧 Tracker Email** will appear.
5.  Run `Initialiser la feuille` to create the logs tab.
