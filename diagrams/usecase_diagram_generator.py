#!/usr/bin/env python3
"""
Générateur de diagramme de cas d'utilisation pour ENT EST Salé
Auteur: Assistant IA
Description: Script Python pour générer un diagramme UML de cas d'utilisation
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrow
import numpy as np

class UseCaseDiagramGenerator:
    def __init__(self):
        self.fig, self.ax = plt.subplots(1, 1, figsize=(16, 12))
        self.ax.set_xlim(0, 20)
        self.ax.set_ylim(0, 15)
        self.ax.set_aspect('equal')
        self.ax.axis('off')
        
        # Couleurs
        self.system_color = '#E3F2FD'
        self.actor_color = '#FFF3E0'
        self.usecase_color = '#F3E5F5'
        self.text_color = '#263238'
        
    def draw_system_boundary(self):
        """Dessine les limites du système ENT EST Salé"""
        system_box = FancyBboxPatch(
            (2, 2), 16, 11,
            boxstyle="round,pad=0.1",
            linewidth=2,
            edgecolor='#1976D2',
            facecolor=self.system_color,
            alpha=0.3
        )
        self.ax.add_patch(system_box)
        self.ax.text(10, 12.5, 'ENT EST Salé - 4 Microservices Actifs', 
                    ha='center', fontsize=16, fontweight='bold', color=self.text_color)
    
    def draw_actors(self):
        """Dessine les acteurs du système"""
        actors = [
            {'name': 'Étudiant', 'x': 1, 'y': 10},
            {'name': 'Enseignant', 'x': 1, 'y': 7},
            {'name': 'Administrateur', 'x': 1, 'y': 4},
            {'name': 'Système IA', 'x': 19, 'y': 8.5}
        ]
        
        for actor in actors:
            # Dessiner l'acteur (person stick figure ou cercle pour système)
            if actor['name'] == 'Système IA':
                circle = Circle((actor['x'], actor['y']), 0.4, 
                              facecolor='#FFC107', edgecolor='#F57C00', linewidth=2)
                self.ax.add_patch(circle)
            else:
                # Tête
                head = Circle((actor['x'], actor['y'] + 0.3), 0.2, 
                            facecolor=self.actor_color, edgecolor='#E65100', linewidth=2)
                self.ax.add_patch(head)
                # Corps
                self.ax.plot([actor['x'], actor['x']], [actor['y'] + 0.1, actor['y'] - 0.3], 
                           color='#E65100', linewidth=2)
                # Bras
                self.ax.plot([actor['x'] - 0.3, actor['x'] + 0.3], 
                           [actor['y'], actor['y']], color='#E65100', linewidth=2)
                # Jambes
                self.ax.plot([actor['x'], actor['x'] - 0.2], [actor['y'] - 0.3, actor['y'] - 0.7], 
                           color='#E65100', linewidth=2)
                self.ax.plot([actor['x'], actor['x'] + 0.2], [actor['y'] - 0.3, actor['y'] - 0.7], 
                           color='#E65100', linewidth=2)
            
            # Nom de l'acteur
            self.ax.text(actor['x'], actor['y'] - 1, actor['name'], 
                        ha='center', fontsize=10, fontweight='bold', color=self.text_color)
    
    def draw_use_cases(self):
        """Dessine les cas d'utilisation pour les 4 microservices actifs"""
        use_cases = [
            # Auth Service
            {'name': 'Se connecter', 'x': 4, 'y': 10.5},
            {'name': 'S\'inscrire', 'x': 7, 'y': 10.5},
            {'name': 'Se déconnecter', 'x': 10, 'y': 10.5},
            {'name': 'Valider token', 'x': 13, 'y': 10.5},
            
            # User Service
            {'name': 'Consulter profil', 'x': 4, 'y': 9},
            {'name': 'Modifier profil', 'x': 7, 'y': 9},
            {'name': 'Mettre à jour infos', 'x': 10, 'y': 9},
            {'name': 'Gérer rôles', 'x': 13, 'y': 9},
            
            # Course Service
            {'name': 'Consulter cours', 'x': 4, 'y': 7.5},
            {'name': 'Créer cours', 'x': 7, 'y': 7.5},
            {'name': 'Modifier cours', 'x': 10, 'y': 7.5},
            {'name': 'Supprimer cours', 'x': 13, 'y': 7.5},
            {'name': 'Lister cours', 'x': 16, 'y': 7.5},
            
            # File Service
            {'name': 'Uploader fichier', 'x': 4, 'y': 6},
            {'name': 'Télécharger fichier', 'x': 7, 'y': 6},
            {'name': 'Supprimer fichier', 'x': 10, 'y': 6},
            {'name': 'Lister fichiers', 'x': 13, 'y': 6},
            {'name': 'Gérer stockage MinIO', 'x': 16, 'y': 6},
        ]
        
        for use_case in use_cases:
            # Dessiner l'ellipse pour le cas d'utilisation
            ellipse = patches.Ellipse(
                (use_case['x'], use_case['y']), 2.5, 0.8,
                facecolor=self.usecase_color,
                edgecolor='#7B1FA2',
                linewidth=2,
                alpha=0.8
            )
            self.ax.add_patch(ellipse)
            
            # Ajouter le texte
            self.ax.text(use_case['x'], use_case['y'], use_case['name'], 
                        ha='center', va='center', fontsize=8, color=self.text_color)
    
    def draw_associations(self):
        """Dessine les associations entre acteurs et cas d'utilisation des 4 microservices"""
        # Étudiant
        student_associations = [
            (1, 10, 4, 10.5),  # Se connecter
            (1, 10, 7, 10.5),  # S'inscrire
            (1, 10, 4, 9),     # Consulter profil
            (1, 10, 7, 9),     # Modifier profil
            (1, 10, 4, 7.5),   # Consulter cours
            (1, 10, 16, 7.5),  # Lister cours
            (1, 10, 7, 6),     # Télécharger fichier
            (1, 10, 13, 6),    # Lister fichiers
        ]
        
        # Enseignant
        teacher_associations = [
            (1, 7, 4, 10.5),   # Se connecter
            (1, 7, 4, 9),      # Consulter profil
            (1, 7, 7, 9),      # Modifier profil
            (1, 7, 4, 7.5),    # Consulter cours
            (1, 7, 7, 7.5),    # Créer cours
            (1, 7, 10, 7.5),   # Modifier cours
            (1, 7, 13, 7.5),   # Supprimer cours
            (1, 7, 4, 6),      # Uploader fichier
            (1, 7, 7, 6),      # Télécharger fichier
            (1, 7, 13, 6),     # Lister fichiers
        ]
        
        # Administrateur
        admin_associations = [
            (1, 4, 4, 10.5),   # Se connecter
            (1, 4, 13, 10.5),  # Valider token
            (1, 4, 13, 9),     # Gérer rôles
            (1, 4, 16, 6),     # Gérer stockage MinIO
        ]
        
        # Système (pour les interactions système)
        system_associations = [
            (19, 8.5, 13, 10.5), # Valider token
        ]
        
        # Dessiner toutes les associations
        all_associations = student_associations + teacher_associations + admin_associations + system_associations
        
        for start_x, start_y, end_x, end_y in all_associations:
            self.ax.plot([start_x + 0.5, end_x - 1.25], [start_y, end_y], 
                       'k-', linewidth=1, alpha=0.6)
    
    def add_legend(self):
        """Ajoute une légende"""
        legend_elements = [
            patches.Patch(color=self.actor_color, label='Acteurs'),
            patches.Patch(color=self.usecase_color, label='Cas d\'utilisation'),
            patches.Patch(color=self.system_color, label='Système ENT')
        ]
        self.ax.legend(handles=legend_elements, loc='upper right', fontsize=10)
    
    def generate_diagram(self, filename='usecase_diagram.png'):
        """Génère le diagramme complet"""
        self.draw_system_boundary()
        self.draw_actors()
        self.draw_use_cases()
        self.draw_associations()
        self.add_legend()
        
        plt.title('Diagramme de Cas d\'Utilisation - ENT EST Salé', 
                 fontsize=18, fontweight='bold', pad=20)
        plt.tight_layout()
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Diagramme généré: {filename}")

def main():
    """Fonction principale"""
    print("🎓 Générateur de Diagramme de Cas d'Utilisation - ENT EST Salé")
    print("=" * 60)
    
    generator = UseCaseDiagramGenerator()
    
    print("📋 Acteurs identifiés:")
    print("  • Étudiant")
    print("  • Enseignant") 
    print("  • Administrateur")
    print("  • Système")
    
    print("\n🔧 Microservices actifs (4):")
    print("  • Auth Service - Authentification et gestion des tokens")
    print("  • User Service - Gestion des profils et rôles")
    print("  • Course Service - Gestion des cours")
    print("  • File Service - Stockage et gestion des fichiers (MinIO)")
    
    print("\n🎨 Génération du diagramme...")
    generator.generate_diagram('ent_est_sale_4microservices_usecase.png')
    
    print("\n✅ Diagramme généré avec succès!")
    print("📁 Fichier sauvegardé: ent_est_sale_4microservices_usecase.png")

if __name__ == "__main__":
    main()
