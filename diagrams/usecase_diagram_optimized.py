#!/usr/bin/env python3
"""
Générateur de diagramme de cas d'utilisation optimisé pour ENT EST Salé
Auteur: Assistant IA
Description: Script Python pour générer un diagramme UML clair et bien organisé
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle
import numpy as np

class OptimizedUseCaseDiagramGenerator:
    def __init__(self):
        self.fig, self.ax = plt.subplots(1, 1, figsize=(20, 16))
        self.ax.set_xlim(0, 24)
        self.ax.set_ylim(0, 18)
        self.ax.set_aspect('equal')
        self.ax.axis('off')
        
        # Couleurs optimisées pour meilleure lisibilité
        self.system_color = '#E8F4FD'
        self.actor_color = '#FFF8E1'
        self.usecase_main_color = '#E8F5E8'
        self.usecase_extend_color = '#FFF3E0'
        self.usecase_include_color = '#E3F2FD'
        self.text_color = '#1A237E'
        self.extend_color = '#FF6F00'
        self.include_color = '#0277BD'
        
    def draw_system_boundary(self):
        """Dessine les limites du système avec design moderne"""
        system_box = FancyBboxPatch(
            (3, 3), 18, 12,
            boxstyle="round,pad=0.15",
            linewidth=3,
            edgecolor='#1565C0',
            facecolor=self.system_color,
            alpha=0.4
        )
        self.ax.add_patch(system_box)
        
        # Titre principal
        self.ax.text(12, 15.5, 'ENT EST Salé - Espace Numérique de Travail', 
                    ha='center', fontsize=22, fontweight='bold', color=self.text_color)
        
        # Sous-titre
        self.ax.text(12, 14.8, 'Diagramme de Cas d\'Utilisation avec Relations UML', 
                    ha='center', fontsize=14, color='#424242', style='italic')
    
    def draw_actors(self):
        """Dessine les acteurs avec positions optimisées"""
        # Positionnement des acteurs sur la gauche avec espacement régulier
        actors = [
            {'name': 'Utilisateur', 'x': 1.5, 'y': 14, 'is_generic': True},
            {'name': 'Étudiant', 'x': 1.5, 'y': 11, 'is_generic': False},
            {'name': 'Enseignant', 'x': 1.5, 'y': 8, 'is_generic': False},
            {'name': 'Administrateur', 'x': 1.5, 'y': 5, 'is_generic': False},
        ]
        
        for i, actor in enumerate(actors):
            # Style différent pour l'acteur générique
            if actor['is_generic']:
                head_color = '#FFC107'
                edge_color = '#F57C00'
            else:
                head_color = self.actor_color
                edge_color = '#E65100'
            
            # Tête
            head = Circle((actor['x'], actor['y'] + 0.3), 0.25, 
                        facecolor=head_color, edgecolor=edge_color, linewidth=2)
            self.ax.add_patch(head)
            
            # Corps
            self.ax.plot([actor['x'], actor['x']], [actor['y'] + 0.05, actor['y'] - 0.4], 
                       color=edge_color, linewidth=3)
            
            # Bras
            self.ax.plot([actor['x'] - 0.35, actor['x'] + 0.35], 
                       [actor['y'] - 0.15, actor['y'] - 0.15], color=edge_color, linewidth=2)
            
            # Jambes
            self.ax.plot([actor['x'], actor['x'] - 0.25], [actor['y'] - 0.4, actor['y'] - 0.9], 
                       color=edge_color, linewidth=2)
            self.ax.plot([actor['x'], actor['x'] + 0.25], [actor['y'] - 0.4, actor['y'] - 0.9], 
                       color=edge_color, linewidth=2)
            
            # Nom de l'acteur avec style
            font_weight = 'bold' if actor['is_generic'] else 'normal'
            self.ax.text(actor['x'], actor['y'] - 1.3, actor['name'], 
                        ha='center', fontsize=11, fontweight=font_weight, color=self.text_color)
    
    def draw_use_cases(self):
        """Dessine les cas d'utilisation avec organisation spatiale optimisée"""
        
        # Cas d'utilisation principaux - rangée supérieure
        main_use_cases = [
            {'name': 'S\'authentifier', 'x': 7, 'y': 13},
            {'name': 'Gérer profil', 'x': 12, 'y': 13},
            {'name': 'Consulter cours', 'x': 17, 'y': 13},
        ]
        
        # Extensions - rangée du milieu
        extend_use_cases = [
            {'name': 'Se connecter', 'x': 5, 'y': 10.5},
            {'name': 'S\'inscrire', 'x': 9, 'y': 10.5},
            {'name': 'Se déconnecter', 'x': 13, 'y': 10.5},
            {'name': 'Consulter profil', 'x': 17, 'y': 10.5},
            
            {'name': 'Modifier profil', 'x': 7, 'y': 9},
            {'name': 'Gérer rôles', 'x': 11, 'y': 9},
            {'name': 'Lister cours', 'x': 15, 'y': 9},
            {'name': 'Créer cours', 'x': 19, 'y': 9},
            
            {'name': 'Modifier cours', 'x': 6, 'y': 7.5},
            {'name': 'Supprimer cours', 'x': 10, 'y': 7.5},
            {'name': 'Uploader fichier', 'x': 14, 'y': 7.5},
            {'name': 'Télécharger fichier', 'x': 18, 'y': 7.5},
        ]
        
        # Inclusions - rangée inférieure
        include_use_cases = [
            {'name': 'Valider token', 'x': 7, 'y': 5.5},
            {'name': 'Vérifier permissions', 'x': 12, 'y': 5.5},
            {'name': 'Logger activité', 'x': 17, 'y': 5.5},
        ]
        
        # Dessiner les cas d'utilisation principaux
        for use_case in main_use_cases:
            self._draw_use_case_ellipse(use_case, self.usecase_main_color, '#2E7D32', 2.8, 0.9)
        
        # Dessiner les extensions
        for use_case in extend_use_cases:
            self._draw_use_case_ellipse(use_case, self.usecase_extend_color, '#E65100', 2.5, 0.8)
        
        # Dessiner les inclusions
        for use_case in include_use_cases:
            self._draw_use_case_ellipse(use_case, self.usecase_include_color, '#1565C0', 2.5, 0.8)
    
    def _draw_use_case_ellipse(self, use_case, face_color, edge_color, width, height):
        """Dessine une ellipse de cas d'utilisation avec style cohérent"""
        ellipse = patches.Ellipse(
            (use_case['x'], use_case['y']), width, height,
            facecolor=face_color,
            edgecolor=edge_color,
            linewidth=2,
            alpha=0.9
        )
        self.ax.add_patch(ellipse)
        
        # Texte avec meilleure lisibilité
        self.ax.text(use_case['x'], use_case['y'], use_case['name'], 
                    ha='center', va='center', fontsize=9, color=self.text_color,
                    fontweight='500')
    
    def draw_inheritance_relations(self):
        """Dessine les relations d'héritage avec flèches claires"""
        # Relations d'héritage depuis Utilisateur vers les acteurs spécifiques
        inheritance_relations = [
            (1.5, 14, 1.5, 11),  # Utilisateur -> Étudiant
            (1.5, 14, 1.5, 8),   # Utilisateur -> Enseignant
            (1.5, 14, 1.5, 5),   # Utilisateur -> Administrateur
        ]
        
        for start_x, start_y, end_x, end_y in inheritance_relations:
            # Ligne d'héritage avec triangle vide
            self.ax.annotate('', xy=(end_x, end_y + 0.9), xytext=(start_x, start_y - 0.9),
                           arrowprops=dict(arrowstyle='->', color='#5D4037', lw=2.5))
            # Label d'héritage
            mid_x = (start_x + end_x) / 2
            mid_y = (start_y + end_y) / 2
            self.ax.text(mid_x + 0.8, mid_y, 'hérite', 
                        fontsize=8, color='#5D4037', style='italic')
    
    def draw_extend_relations(self):
        """Dessine les relations extend avec organisation claire"""
        extend_relations = [
            # S'authentifier vers ses extensions
            (7, 13, 5, 10.5),    # -> Se connecter
            (7, 13, 9, 10.5),    # -> S'inscrire
            (7, 13, 13, 10.5),   # -> Se déconnecter
            
            # Gérer profil vers ses extensions
            (12, 13, 17, 10.5),  # -> Consulter profil
            (12, 13, 7, 9),      # -> Modifier profil
            (12, 13, 11, 9),     # -> Gérer rôles
            
            # Consulter cours vers ses extensions
            (17, 13, 15, 9),     # -> Lister cours
            (17, 13, 19, 9),     # -> Créer cours
            (17, 13, 6, 7.5),    # -> Modifier cours
            (17, 13, 10, 7.5),   # -> Supprimer cours
            
            # Gérer fichiers (implicite) vers ses extensions
            (19, 13, 14, 7.5),   # -> Uploader fichier
            (19, 13, 18, 7.5),   # -> Télécharger fichier
        ]
        
        for start_x, start_y, end_x, end_y in extend_relations:
            self.ax.annotate('', xy=(end_x, end_y), xytext=(start_x, start_y),
                           arrowprops=dict(arrowstyle='->', color=self.extend_color, 
                                         lw=2, linestyle='dashed', alpha=0.8))
            # Label <<extend>>
            mid_x = (start_x + end_x) / 2
            mid_y = (start_y + end_y) / 2
            self.ax.text(mid_x + 0.3, mid_y + 0.3, '<<extend>>', 
                        fontsize=7, color=self.extend_color, fontweight='bold')
    
    def draw_include_relations(self):
        """Dessine les relations include avec clarté"""
        include_relations = [
            (7, 13, 7, 5.5),     # S'authentifier include Valider token
            (12, 13, 12, 5.5),   # Gérer profil include Vérifier permissions
            (17, 13, 17, 5.5),   # Consulter cours include Logger activité
        ]
        
        for start_x, start_y, end_x, end_y in include_relations:
            self.ax.annotate('', xy=(end_x, end_y), xytext=(start_x, start_y),
                           arrowprops=dict(arrowstyle='->', color=self.include_color, 
                                         lw=2, linestyle='dotted', alpha=0.8))
            # Label <<include>>
            mid_x = (start_x + end_x) / 2
            mid_y = (start_y + end_y) / 2
            self.ax.text(mid_x + 0.3, mid_y + 0.3, '<<include>>', 
                        fontsize=7, color=self.include_color, fontweight='bold')
    
    def draw_associations(self):
        """Dessine les associations entre acteurs et cas d'utilisation principaux"""
        # Tous les acteurs utilisent les cas d'utilisation principaux
        actor_associations = [
            # Étudiant
            (1.8, 11, 7, 13),    # S'authentifier
            (1.8, 11, 12, 13),   # Gérer profil
            (1.8, 11, 17, 13),   # Consulter cours
            
            # Enseignant
            (1.8, 8, 7, 13),     # S'authentifier
            (1.8, 8, 12, 13),    # Gérer profil
            (1.8, 8, 17, 13),    # Consulter cours
            
            # Administrateur
            (1.8, 5, 7, 13),     # S'authentifier
            (1.8, 5, 12, 13),    # Gérer profil
            (1.8, 5, 17, 13),    # Consulter cours
        ]
        
        for start_x, start_y, end_x, end_y in actor_associations:
            self.ax.plot([start_x, end_x - 1.4], [start_y, end_y], 
                       'k-', linewidth=1.5, alpha=0.7)
    
    def add_comprehensive_legend(self):
        """Ajoute une légende complète et bien organisée"""
        legend_elements = [
            patches.Patch(color=self.actor_color, label='Acteurs concrets'),
            patches.Patch(color='#FFC107', label='Acteur générique'),
            patches.Patch(color=self.usecase_main_color, label='Cas d\'utilisation principaux'),
            patches.Patch(color=self.usecase_extend_color, label='Extensions (<<extend>>)'),
            patches.Patch(color=self.usecase_include_color, label='Inclusions (<<include>>)'),
            plt.Line2D([0], [0], color='#5D4037', linewidth=2.5, label='Héritage'),
            plt.Line2D([0], [0], color=self.extend_color, linewidth=2, 
                      linestyle='dashed', label='Relation Extend'),
            plt.Line2D([0], [0], color=self.include_color, linewidth=2, 
                      linestyle='dotted', label='Relation Include'),
            plt.Line2D([0], [0], color='black', linewidth=1.5, label='Association'),
        ]
        
        # Positionnement optimisé de la légende
        self.ax.legend(handles=legend_elements, loc='upper right', fontsize=10, 
                      framealpha=0.95, fancybox=True, shadow=True)
    
    def add_zone_labels(self):
        """Ajoute des étiquettes pour les zones fonctionnelles"""
        # Zone Authentification
        self.ax.text(7, 14.5, 'AUTHENTIFICATION', ha='center', fontsize=10, 
                    color='#1565C0', fontweight='bold', alpha=0.7)
        
        # Zone Gestion Utilisateur
        self.ax.text(12, 14.5, 'GESTION UTILISATEUR', ha='center', fontsize=10, 
                    color='#1565C0', fontweight='bold', alpha=0.7)
        
        # Zone Cours
        self.ax.text(17, 14.5, 'GESTION COURS', ha='center', fontsize=10, 
                    color='#1565C0', fontweight='bold', alpha=0.7)
        
        # Zone Services
        self.ax.text(12, 4.5, 'SERVICES SYSTÈME', ha='center', fontsize=10, 
                    color='#1565C0', fontweight='bold', alpha=0.7)
    
    def generate_diagram(self, filename='ent_est_sale_usecase_optimized.png'):
        """Génère le diagramme optimisé"""
        self.draw_system_boundary()
        self.draw_actors()
        self.draw_use_cases()
        self.draw_inheritance_relations()
        self.draw_extend_relations()
        self.draw_include_relations()
        self.draw_associations()
        self.add_zone_labels()
        self.add_comprehensive_legend()
        
        plt.tight_layout()
        plt.savefig(filename, dpi=300, bbox_inches='tight', facecolor='white')
        plt.show()
        print(f"Diagramme optimisé généré: {filename}")

def main():
    """Fonction principale"""
    print("🎓 Générateur de Diagramme de Cas d'Utilisation Optimisé - ENT EST Salé")
    print("=" * 85)
    
    generator = OptimizedUseCaseDiagramGenerator()
    
    print("📋 Structure du diagramme:")
    print("  🏗️  Organisation spatiale optimisée")
    print("  🎨 Couleurs améliorées pour lisibilité")
    print("  📐 Positions logiques des éléments")
    print("  🔍 Étiquettes de zones fonctionnelles")
    
    print("\n👥 Acteurs avec héritage clair:")
    print("  • Utilisateur (générique)")
    print("    ├── Étudiant")
    print("    ├── Enseignant")
    print("    └── Administrateur")
    
    print("\n🔧 Fonctionnalités organisées par zones:")
    print("  • AUTHENTIFICATION - S'authentifier + extensions")
    print("  • GESTION UTILISATEUR - Gérer profil + extensions")
    print("  • GESTION COURS - Consulter cours + extensions")
    print("  • SERVICES SYSTÈME - Inclusions obligatoires")
    
    print("\n🔗 Relations UML standards:")
    print("  • ───► : Héritage (triangle vide)")
    print("  • - - -> : Extension (<<extend>>)")
    print("  • · · -> : Inclusion (<<include>>)")
    print("  • ─── : Association simple")
    
    print("\n🎨 Génération du diagramme optimisé...")
    generator.generate_diagram()
    
    print("\n✅ Diagramme optimisé généré avec succès!")
    print("📁 Fichier sauvegardé: ent_est_sale_usecase_optimized.png")
    print("🌟 Caractéristiques: Meilleure lisibilité, organisation claire, design professionnel")

if __name__ == "__main__":
    main()
