# Diagramme de Cas d'Utilisation - ENT EST Salé

## Script Python pour générer un diagramme UML de cas d'utilisation

### Description
Ce script Python génère automatiquement un diagramme de cas d'utilisation complet pour la plateforme ENT EST Salé en utilisant matplotlib.

### Acteurs principaux
- **Étudiant**: Accède aux cours, soumet des devoirs, consulte l'emploi du temps
- **Enseignant**: Crée et gère les cours, les examens, note les devoirs
- **Administrateur**: Gère les utilisateurs, supervise la plateforme
- **Système IA**: Assistant intelligent pour l'aide et le support

### Cas d'utilisation identifiés

#### Authentification
- Se connecter
- S'inscrire
- Se déconnecter

#### Gestion utilisateur
- Consulter profil
- Modifier profil
- Gérer utilisateurs (Admin)

#### Cours et Fichiers
- Consulter cours
- Créer cours (Enseignant)
- Modifier cours (Enseignant)
- Supprimer cours (Enseignant)
- Télécharger fichiers

#### Messagerie
- Envoyer message
- Consulter messages
- Chat temps réel

#### Calendrier
- Consulter calendrier
- Créer événement
- Modifier événement

#### Examens
- Consulter examens
- Créer examen (Enseignant)
- Soumettre devoir (Étudiant)
- Noter devoir (Enseignant)

#### Assistant IA
- Discuter avec IA
- Aide aux devoirs

### Installation des dépendances
```bash
pip install matplotlib numpy
```

### Exécution du script
```bash
python usecase_diagram_generator.py
```

Le script générera un fichier image `ent_est_sale_usecase_diagram.png` contenant le diagramme UML complet.

### Architecture technique
Le script utilise:
- **matplotlib** pour la génération graphique
- **numpy** pour les calculs mathématiques
- **POO** pour une structure modulaire et maintenable

### Personnalisation
Le script peut être facilement modifié pour:
- Ajouter de nouveaux acteurs
- Modifier les cas d'utilisation
- Changer les couleurs et le style
- Exporter dans différents formats (PNG, SVG, PDF)
