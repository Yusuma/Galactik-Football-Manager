# Galactik Manager (GFM)

Jeu de gestion **7 contre 7** inspiré de *Galactik Football*. Dirigez un club de la Galactik League, la sélection d’une planète dans la Galactik Cup, ou les deux.

> **Projet de fan, gratuit et sans but lucratif.** Non affilié aux ayants droit de la série.
> Version actuelle : **1.30.0.0 (bêta)**

> **Avertissement** : Galactik Manager est un **projet de fans non officiel**, entièrement **gratuit et sans aucun but lucratif**. Il n’est ni affilié, ni approuvé, ni sponsorisé par les ayants droit de « Galactik Football », dont les noms, personnages et univers restent la propriété de leurs titulaires. Pour toute demande de modification ou de retrait, contactez l’auteur.

Le jeu tient dans **une seule page web** (`index.html`) : aucune installation, aucun serveur, aucun compte, aucune publicité.

## Jouer

Ouvrez l’adresse GitHub Pages du dépôt (*Settings → Pages*). Le jeu fonctionne dans un navigateur récent (Chrome, Edge, Firefox, Safari), sur ordinateur (le jeu est désormais optimisé pour PC uniquement). Il peut aussi être installé comme application (PWA) depuis le navigateur.

## Fonctionnalités

- **Clubs et compétitions** : championnat de 14 clubs, Coupe de la Ligue, Galactik Cup, avec calendrier, résultats, historique et classements (buteurs, passeurs, gardiens, équipes).
- **Matchs 7 contre 7** en direct : tactique, remplacements, mi-temps, **Fluides** (pouvoirs des joueurs), blessures et fatigue.
- **Effectif** : cartes ou liste, jauges d’endurance et de Fluide, rareté des cartes (dont chromatiques et prismatiques), vieillissement et progression.
- **Mercato** : transferts, prêts, ventes, offres.
- **Centre de formation** : axe de formation, mentor, promotion des jeunes en fin de saison.
- **Gestion du club** : finances, sponsors, staff, installations, objectifs, conseil d’administration.
- **Manager personnalisé** : nom, apparence et passé avec des bonus de carrière.
- **Messagerie** : boîte de réception type webmail (recherche, dossiers, suivis, sélection multiple, corbeille).
- **Statistiques** : bilan du club, joueurs, finances, records et graphiques.
- **Aperçu** : tableau de bord avec jauges, prochain match et informations clés.
- **Éditeur de mods** : équipes, joueurs, Fluides, couleurs et compétitions.
- **Confort** : taille du texte, contraste élevé, animations réduites, sons, raccourcis clavier, interface aux couleurs du club.
- **Animation des matchs** : terrain 2D aux couleurs de la planète, aura de Fluide, rejeu, ambiance de foule, rythme du match ; tout est désactivable dans Paramètres > Animation des matchs.
- **Tutoriel** et **visite guidée** intégrés, avec des bulles d’aide « ? » partout.

## Sauvegardes

- Les parties sont enregistrées **dans le navigateur** de chaque joueur (stockage local). **Rien n’est envoyé en ligne.**
- Une sauvegarde automatique et 5 emplacements sont disponibles.
- **Exportez vos sauvegardes** (Menu → Charger une partie → Exporter) avant une mise à jour ou avant de vider les données du navigateur.
- Une mise à jour peut rendre une ancienne sauvegarde incompatible ; l’écran de création de partie indique la compatibilité.

## Numérotation des versions

`1.<patch>.<x>.<y>` : le deuxième nombre augmente à chaque **patch** (nouveautés publiques) ; `x` et `y` comptent les modifications intermédiaires. Exemple : `1.28.0.0` est le patch 28.

## Bêta : retours

Un bug, une idée ?
- Bouton **Signaler un bug / une idée** dans le menu du jeu (le rapport peut inclure la version et le navigateur).
- Ou l’onglet **Issues** du dépôt.

Merci d’indiquer la version du jeu (affichée à côté du titre) et ce que vous faisiez juste avant.

## Feuille de route

Consultable dans le jeu (bouton Roadmap) : logos personnalisés pour toutes les équipes, éditeur d’écusson, création du manager améliorée, intégration Twitch (à l’étude).

## Hébergement (pour le mainteneur)

Fichiers du dépôt : `index.html` (le jeu), `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `.nojekyll`.
1. *Settings → Pages* → source : branche `main`, dossier `/ (root)`.
2. Pour mettre à jour : remplacer `index.html` par la nouvelle version et valider (*commit*).
3. Après une mise à jour, un rechargement forcé (Ctrl+F5) peut être nécessaire pour voir la nouvelle version.

## Vie privée et légal

Aucun cookie, aucun compte, aucun traceur. Le jeu charge ses polices depuis Google Fonts. Les pages **Mentions légales, Conditions d’utilisation, Confidentialité et Cookies** sont accessibles depuis l’accueil du jeu et ses paramètres.

*Fan game non officiel, réalisé avec Claude. Galactik Football appartient à ses ayants droit.*

## Photos des joueurs (emplacement prévu)
Les fiches joueurs affichent un cadre « photo de visage » (silhouette par défaut). Pour ajouter une photo, renseignez le tableau `PHOTOS` dans `index.html` : `PHOTOS['Nom du joueur']='photos/nom.png'` (ou une adresse data:). Dossier conseillé : `photos/`, images carrées.
