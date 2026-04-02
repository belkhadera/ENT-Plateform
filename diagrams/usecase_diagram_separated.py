#!/usr/bin/env python3
"""
Générateur de diagrammes de cas d'utilisation séparés par acteur pour ENT EST Salé
Auteur: Assistant IA
Description: Script Python pour générer des diagrammes UML de cas d'utilisation pour chaque acteur
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrow
import numpy as np

class SeparatedUseCaseDiagramGenerator:
    def __init__(self):
        # Couleurs
        self.system_color = '#E3F2FD'
        self.actor_color = '#FFF3E0'
        self.usecase_color = '#F3E5F5'
        self.text_color = '#263238'
        
    def create_student_diagram(self):
        """Crée le diagramme pour l'Étudiant"""
        fig, ax = plt.subplots(1, 1, figsize=(14, 10))
        ax.set_xlim(0, 15)
        ax.set_ylim(0, 12)
        ax.set_aspect('equal')
        ax.axis('off')
        
        # Système
        system_box = FancyBboxPatch(
            (2, 2), 11, 8,
            boxstyle="round,pad=0.1",
            linewidth=2,
            edgecolor='#1976D2',
            facecolor=self.system_color,
            alpha=0.3
        )
        ax.add_patch(system_box)
        ax.text(7.5, 10.5, 'ENT EST Salé - Vue Étudiant', 
                ha='center', fontsize=16, fontweight='bold', color=self.text_color)
        
        # Acteur Étudiant
        head = Circle((1, 7), 0.2, facecolor=self.actor_color, edgecolor='#E65100', linewidth=2)
        ax.add_patch(head)
        ax.plot([1, 1], [6.8, 6.4], color='#E65100', linewidth=2)
        ax.plot([0.7, 1.3], [6.6, 6.6], color='#E65100', linewidth=2)
        ax.plot([1, 0.8], [6.4, 6], color='#E65100', linewidth=2)
        ax.plot([1, 1.2], [6.4, 6], color='#E65100', linewidth=2)
        ax.text(1, 5.5, 'Étudiant', ha='center', fontsize=12, fontweight='bold', color=self.text_color)
        
        # Cas d'utilisation Étudiant
        student_use_cases = [
            {'name': 'Se connecter', 'x': 4, 'y': 9},
            {'name': 'S\'inscrire', 'x': 7, 'y': 9},
            {'name': 'Consulter profil', 'x': 10, 'y': 9},
            {'name': 'Modifier profil', 'x': 13, 'y': 9},
            {'name': 'Consulter cours', 'x': 4, 'y': 7.5},
            {'name': 'Lister cours', 'x': 7, 'y': 7.5},
            {'name': 'Télécharger fichier', 'x': 10, 'y': 7.5},
            {'name': 'Lister fichiers', 'x': 13, 'y': 7.5},
            {'name': 'Valider token', 'x': 5.5, 'y': 6},
        ]
        
        for use_case in student_use_cases:
            ellipse = patches.Ellipse(
                (use_case['x'], use_case['y']), 2.2, 0.7,
                facecolor=self.usecase_color,
                edgecolor='#7B1FA2',
                linewidth=2,
                alpha=0.8
            )
            ax.add_patch(ellipse)
            ax.text(use_case['x'], use_case['y'], use_case['name'], 
                   ha='center', va='center', fontsize=8, color=self.text_color)
        
        # Associations
        associations = [
            (1.3, 7, 4, 9),      # Se connecter
            (1.3, 7, 7, 9),      # S'inscrire
            (1.3, 7, 10, 9),     # Consulter profil
            (1.3, 7, 13, 9),     # Modifier profil
            (1.3, 7, 4, 7.5),    # Consulter cours
            (1.3, 7, 7, 7.5),    # Lister cours
            (1.3, 7, 10, 7.5),   # Télécharger fichier
            (1.3, 7, 13, 7.5),   # Lister fichiers
        ]
        
        for start_x, start_y, end_x, end_y in associations:
            ax.plot([start_x, end_x - 1.1], [start_y, end_y], 
                   'k-', linewidth=1, alpha=0.6)
        
        plt.title('Diagramme de Cas d\'Utilisation - Étudiant', fontsize=18, fontweight='bold', pad=20)
        plt.tight_layout()
        plt.savefig('ent_est_sale_student_usecase.png', dpi=300, bbox_inches='tight')
        plt.close()
        
    def create_teacher_diagram(self):
        """Crée le diagramme pour l'Enseignant"""
        fig, ax = plt.subplots(1, 1, figsize=(14, 10))
        ax.set_xlim(0, 15)
        ax.set_ylim(0, 12)
        ax.set_aspect('equal')
        ax.axis('off')
        
        # Système
        system_box = FancyBboxPatch(
            (2, 2), 11, 8,
            boxstyle="round,pad=0.1",
            linewidth=2,
            edgecolor='#1976D2',
            facecolor=self.system_color,
            alpha=0.3
        )
        ax.add_patch(system_box)
        ax.text(7.5, 10.5, 'ENT EST Salé - Vue Enseignant', 
                ha='center', fontsize=16, fontweight='bold', color=self.text_color)
        
        # Acteur Enseignant
        head = Circle((1, 7), 0.2, facecolor=self.actor_color, edgecolor='#E65100', linewidth=2)
        ax.add_patch(head)
        ax.plot([1, 1], [6.8, 6.4], color='#E65100', linewidth=2)
        ax.plot([0.7, 1.3], [6.6, 6.6], color='#E65100', linewidth=2)
        ax.plot([1, 0.8], [6.4, 6], color='#E65100', linewidth=2)
        ax.plot([1, 1.2], [6.4, 6], color='#E65100', linewidth=2)
        ax.text(1, 5.5, 'Enseignant', ha='center', fontsize=12, fontweight='bold', color=self.text_color)
        
        # Cas d'utilisation Enseignant
        teacher_use_cases = [
            {'name': 'Se connecter', 'x': 4, 'y': 9},
            {'name': 'Consulter profil', 'x': 7, 'y': 9},
            {'name': 'Modifier profil', 'x': 10, 'y': 9},
            {'name': 'Consulter cours', 'x': 4, 'y': 7.5},
            {'name': 'Créer cours', 'x': 7, 'y': 7.5},
            {'name': 'Modifier cours', 'x': 10, 'y': 7.5},
            {'name': 'Supprimer cours', 'x': 13, 'y': 7.5},
            {'name': 'Uploader fichier', 'x': 4, 'y': 6},
            {'name': 'Télécharger fichier', 'x': 7, 'y': 6},
            {'name': 'Lister fichiers', 'x': 10, 'y': 6},
        ]
        
        for use_case in teacher_use_cases:
            ellipse = patches.Ellipse(
                (use_case['x'], use_case['y']), 2.2, 0.7,
                facecolor=self.usecase_color,
                edgecolor='#7B1FA2',
                linewidth=2,
                alpha=0.8
            )
            ax.add_patch(ellipse)
            ax.text(use_case['x'], use_case['y'], use_case['name'], 
                   ha='center', va='center', fontsize=8, color=self.text_color)
        
        # Associations
        associations = [
            (1.3, 7, 4, 9),      # Se connecter
            (1.3, 7, 7, 9),      # Consulter profil
            (1.3, 7, 10, 9),     # Modifier profil
            (1.3, 7, 4, 7.5),    # Consulter cours
            (1.3, 7, 7, 7.5),    # Créer cours
            (1.3, 7, 10, 7.5),   # Modifier cours
            (1.3, 7, 13, 7.5),   # Supprimer cours
            (1.3, 7, 4, 6),      # Uploader fichier
            (1.3, 7, 7, 6),      # Télécharger fichier
            (1.3, 7, 10, 6),     # Lister fichiers
        ]
        
        for start_x, start_y, end_x, end_y in associations:
            ax.plot([start_x, end_x - 1.1], [start_y, end_y], 
                   'k-', linewidth=1, alpha=0.6)
        
        plt.title('Diagramme de Cas d\'Utilisation - Enseignant', fontsize=18, fontweight='bold', pad=20)
        plt.tight_layout()
        plt.savefig('ent_est_sale_teacher_usecase.png', dpi=300, bbox_inches='tight')
        plt.close()
        
    def create_admin_diagram(self):
        """Crée le diagramme pour l'Administrateur"""
        fig, ax = plt.subplots(1, 1, figsize=(12, 8))
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.set_aspect('equal')
        ax.axis('off')
        
        # Système
        system_box = FancyBboxPatch(
            (2, 2), 8, 6,
            boxstyle="round,pad=0.1",
            linewidth=2,
            edgecolor='#1976D2',
            facecolor=self.system_color,
            alpha=0.3
        )
        ax.add_patch(system_box)
        ax.text(6, 8.5, 'ENT EST Salé - Vue Administrateur', 
                ha='center', fontsize=16, fontweight='bold', color=self.text_color)
        
        # Acteur Administrateur
        head = Circle((1, 5), 0.2, facecolor=self.actor_color, edgecolor='#E65100', linewidth=2)
        ax.add_patch(head)
        ax.plot([1, 1], [4.8, 4.4], color='#E65100', linewidth=2)
        ax.plot([0.7, 1.3], [4.6, 4.6], color='#E65100', linewidth=2)
        ax.plot([1, 0.8], [4.4, 4], color='#E65100', linewidth=2)
        ax.plot([1, 1.2], [4.4, 4], color='#E65100', linewidth=2)
        ax.text(1, 3.5, 'Administrateur', ha='center', fontsize=12, fontweight='bold', color=self.text_color)
        
        # Cas d'utilisation Administrateur
        admin_use_cases = [
            {'name': 'Se connecter', 'x': 4, 'y': 7},
            {'name': 'Valider token', 'x': 7, 'y': 7},
            {'name': 'Gérer rôles', 'x': 4, 'y': 5.5},
            {'name': 'Gérer stockage MinIO', 'x': 7, 'y': 5.5},
        ]
        
        for use_case in admin_use_cases:
            ellipse = patches.Ellipse(
                (use_case['x'], use_case['y']), 2.2, 0.7,
                facecolor=self.usecase_color,
                edgecolor='#7B1FA2',
                linewidth=2,
                alpha=0.8
            )
            ax.add_patch(ellipse)
            ax.text(use_case['x'], use_case['y'], use_case['name'], 
                   ha='center', va='center', fontsize=8, color=self.text_color)
        
        # Associations
        associations = [
            (1.3, 5, 4, 7),      # Se connecter
            (1.3, 5, 7, 7),      # Valider token
            (1.3, 5, 4, 5.5),    # Gérer rôles
            (1.3, 5, 7, 5.5),    # Gérer stockage MinIO
        ]
        
        for start_x, start_y, end_x, end_y in associations:
            ax.plot([start_x, end_x - 1.1], [start_y, end_y], 
                   'k-', linewidth=1, alpha=0.6)
        
        plt.title('Diagramme de Cas d\'Utilisation - Administrateur', fontsize=18, fontweight='bold', pad=20)
        plt.tight_layout()
        plt.savefig('ent_est_sale_admin_usecase.png', dpi=300, bbox_inches='tight')
        plt.close()
        
    def create_system_diagram(self):
        """Crée le diagramme pour les interactions système"""
        fig, ax = plt.subplots(1, 1, figsize=(12, 8))
        ax.set_xlim(0, 12)
        ax.set_ylim(0, 10)
        ax.set_aspect('equal')
        ax.axis('off')
        
        # Système
        system_box = FancyBboxPatch(
            (2, 2), 8, 6,
            boxstyle="round,pad=0.1",
            linewidth=2,
            edgecolor='#1976D2',
            facecolor=self.system_color,
            alpha=0.3
        )
        ax.add_patch(system_box)
        ax.text(6, 8.5, 'ENT EST Salé - Vue Système', 
                ha='center', fontsize=16, fontweight='bold', color=self.text_color)
        
        # Acteur Système
        circle = Circle((1, 5), 0.3, facecolor='#FFC107', edgecolor='#F57C00', linewidth=2)
        ax.add_patch(circle)
        ax.text(1, 4.2, 'Système', ha='center', fontsize=12, fontweight='bold', color=self.text_color)
        
        # Cas d'utilisation Système
        system_use_cases = [
            {'name': 'Valider token JWT', 'x': 5, 'y': 6.5},
            {'name': 'Gérer authentification', 'x': 5, 'y': 5},
            {'name': 'Superviser services', 'x': 8, 'y': 6.5},
            {'name': 'Gérer MinIO', 'x': 8, 'y': 5},
        ]
        
        for use_case in system_use_cases:
            ellipse = patches.Ellipse(
                (use_case['x'], use_case['y']), 2.2, 0.7,
                facecolor=self.usecase_color,
                edgecolor='#7B1FA2',
                linewidth=2,
                alpha=0.8
            )
            ax.add_patch(ellipse)
            ax.text(use_case['x'], use_case['y'], use_case['name'], 
                   ha='center', va='center', fontsize=8, color=self.text_color)
        
        # Associations
        associations = [
            (1.3, 5, 5, 6.5),     # Valider token JWT
            (1.3, 5, 5, 5),       # Gérer authentification
            (1.3, 5, 8, 6.5),     # Superviser services
            (1.3, 5, 8, 5),       # Gérer MinIO
        ]
        
        for start_x, start_y, end_x, end_y in associations:
            ax.plot([start_x, end_x - 1.1], [start_y, end_y], 
                   'k-', linewidth=1, alpha=0.6)
        
        plt.title('Diagramme de Cas d\'Utilisation - Système', fontsize=18, fontweight='bold', pad=20)
        plt.tight_layout()
        plt.savefig('ent_est_sale_system_usecase.png', dpi=300, bbox_inches='tight')
        plt.close()
        
    def generate_all_diagrams(self):
        """Génère tous les diagrammes séparés"""
        print("🎓 Générateur de Diagrammes de Cas d'Utilisation Séparés - ENT EST Salé")
        print("=" * 70)
        
        print("\n📊 Génération des diagrammes par acteur...")
        
        print("  📱 Création du diagramme Étudiant...")
        self.create_student_diagram()
        
        print("  👨‍🏫 Création du diagramme Enseignant...")
        self.create_teacher_diagram()
        
        print("  👨‍💼 Création du diagramme Administrateur...")
        self.create_admin_diagram()
        
        print("  🖥️ Création du diagramme Système...")
        self.create_system_diagram()
        
        print("\n✅ Tous les diagrammes ont été générés avec succès!")
        print("\n📁 Fichiers créés:")
        print("  • ent_est_sale_student_usecase.png")
        print("  • ent_est_sale_teacher_usecase.png")
        print("  • ent_est_sale_admin_usecase.png")
        print("  • ent_est_sale_system_usecase.png")

def main():
    """Fonction principale"""
    generator = SeparatedUseCaseDiagramGenerator()
    generator.generate_all_diagrams()

if __name__ == "__main__":
    main()
