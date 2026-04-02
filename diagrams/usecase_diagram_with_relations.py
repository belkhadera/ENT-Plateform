#!/usr/bin/env python3
"""
Générateur de diagramme de cas d'utilisation avec relations extend et include pour ENT EST Salé
Auteur: Assistant IA
Description: Script Python pour générer un diagramme UML complet avec relations d'héritage
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrow, ConnectionPatch
import numpy as np

class UseCaseDiagramWithRelations:
    def __init__(self):
        self.fig, self.ax = plt.subplots(1, 1, figsize=(18, 14))
        self.ax.set_xlim(0, 22)
        self.ax.set_ylim(0, 16)
        self.ax.set_aspect('equal')
        self.ax.axis('off')
        
        # Couleurs
        self.system_color = '#E3F2FD'
        self.actor_color = '#FFF3E0'
        self.usecase_color = '#F3E5F5'
        self.text_color = '#263238'
        self.extend_color = '#FF9800'
        self.include_color = '#4CAF50'
        
    def draw_system_boundary(self):
        """Dessine les limites du système ENT EST Salé"""
        system_box = FancyBboxPatch(
            (2, 2), 18, 13,
            boxstyle="round,pad=0.1",
            linewidth=2,
            edgecolor='#1976D2',
            facecolor=self.system_color,
            alpha=0.3
        )
        self.ax.add_patch(system_box)
        self.ax.text(11, 14.5, 'ENT EST Salé - Espace Numérique de Travail', 
                    ha='center', fontsize=18, fontweight='bold', color=self.text_color)
    
    def draw_actors(self):
        """Dessine les acteurs du système"""
        actors = [
            {'name': 'Étudiant', 'x': 1, 'y': 11},
            {'name': 'Enseignant', 'x': 1, 'y': 8},
            {'name': 'Administrateur', 'x': 1, 'y': 5},
            {'name': 'Utilisateur', 'x': 1, 'y': 2.5},  # Acteur générique
        ]
        
        for actor in actors:
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
        """Dessine les cas d'utilisation"""
        use_cases = [
            # Cas d'utilisation principaux
            {'name': 'S\'authentifier', 'x': 5, 'y': 12, 'type': 'main'},
            {'name': 'Gérer profil', 'x': 9, 'y': 12, 'type': 'main'},
            {'name': 'Consulter cours', 'x': 13, 'y': 12, 'type': 'main'},
            {'name': 'Gérer fichiers', 'x': 17, 'y': 12, 'type': 'main'},
            
            # Extensions pour S'authentifier
            {'name': 'Se connecter', 'x': 5, 'y': 10.5, 'type': 'extend'},
            {'name': 'S\'inscrire', 'x': 7, 'y': 10.5, 'type': 'extend'},
            {'name': 'Se déconnecter', 'x': 9, 'y': 10.5, 'type': 'extend'},
            
            # Extensions pour Gérer profil
            {'name': 'Consulter profil', 'x': 9, 'y': 10.5, 'type': 'extend'},
            {'name': 'Modifier profil', 'x': 11, 'y': 10.5, 'type': 'extend'},
            {'name': 'Gérer rôles', 'x': 13, 'y': 10.5, 'type': 'extend'},
            
            # Extensions pour Consulter cours
            {'name': 'Lister cours', 'x': 13, 'y': 10.5, 'type': 'extend'},
            {'name': 'Créer cours', 'x': 15, 'y': 10.5, 'type': 'extend'},
            {'name': 'Modifier cours', 'x': 17, 'y': 10.5, 'type': 'extend'},
            {'name': 'Supprimer cours', 'x': 19, 'y': 10.5, 'type': 'extend'},
            
            # Extensions pour Gérer fichiers
            {'name': 'Uploader fichier', 'x': 17, 'y': 10.5, 'type': 'extend'},
            {'name': 'Télécharger fichier', 'x': 19, 'y': 10.5, 'type': 'extend'},
            {'name': 'Supprimer fichier', 'x': 17, 'y': 9, 'type': 'extend'},
            
            # Inclusions communes
            {'name': 'Valider token', 'x': 5, 'y': 8, 'type': 'include'},
            {'name': 'Vérifier permissions', 'x': 9, 'y': 8, 'type': 'include'},
            {'name': 'Logger activité', 'x': 13, 'y': 8, 'type': 'include'},
            {'name': 'Gérer MinIO', 'x': 17, 'y': 8, 'type': 'include'},
        ]
        
        for use_case in use_cases:
            # Couleur selon le type
            if use_case['type'] == 'main':
                face_color = '#E8F5E8'
                edge_color = '#2E7D32'
            elif use_case['type'] == 'extend':
                face_color = '#FFF3E0'
                edge_color = '#E65100'
            else:  # include
                face_color = '#E3F2FD'
                edge_color = '#1565C0'
            
            # Dessiner l'ellipse pour le cas d'utilisation
            ellipse = patches.Ellipse(
                (use_case['x'], use_case['y']), 2.5, 0.8,
                facecolor=face_color,
                edgecolor=edge_color,
                linewidth=2,
                alpha=0.8
            )
            self.ax.add_patch(ellipse)
            
            # Ajouter le texte
            self.ax.text(use_case['x'], use_case['y'], use_case['name'], 
                        ha='center', va='center', fontsize=8, color=self.text_color)
    
    def draw_inheritance_relations(self):
        """Dessine les relations d'héritage entre acteurs"""
        # Flèches d'héritage (triangles vides)
        inheritance_relations = [
            # Étudiant hérite de Utilisateur
            (1, 2.5, 1, 11),
            # Enseignant hérite de Utilisateur  
            (1, 2.5, 1, 8),
            # Administrateur hérite de Utilisateur
            (1, 2.5, 1, 5),
        ]
        
        for start_x, start_y, end_x, end_y in inheritance_relations:
            # Ligne d'héritage
            self.ax.annotate('', xy=(end_x, end_y + 0.7), xytext=(start_x, start_y + 0.7),
                           arrowprops=dict(arrowstyle='->', color='#795548', lw=2))
    
    def draw_extend_relations(self):
        """Dessine les relations extend (pointillés avec flèche vide)"""
        extend_relations = [
            # S'authentifier <<extend>> Se connecter, S'inscrire, Se déconnecter
            (5, 12, 5, 10.5),
            (5, 12, 7, 10.5),
            (5, 12, 9, 10.5),
            
            # Gérer profil <<extend>> Consulter profil, Modifier profil, Gérer rôles
            (9, 12, 9, 10.5),
            (9, 12, 11, 10.5),
            (9, 12, 13, 10.5),
            
            # Consulter cours <<extend>> Lister cours, Créer cours, Modifier cours, Supprimer cours
            (13, 12, 13, 10.5),
            (13, 12, 15, 10.5),
            (13, 12, 17, 10.5),
            (13, 12, 19, 10.5),
            
            # Gérer fichiers <<extend>> Uploader fichier, Télécharger fichier, Supprimer fichier
            (17, 12, 17, 10.5),
            (17, 12, 19, 10.5),
            (17, 12, 17, 9),
        ]
        
        for start_x, start_y, end_x, end_y in extend_relations:
            self.ax.annotate('', xy=(end_x, end_y), xytext=(start_x, start_y),
                           arrowprops=dict(arrowstyle='->', color=self.extend_color, 
                                         lw=1.5, linestyle='dashed'))
            # Ajouter le label <<extend>>
            mid_x, mid_y = (start_x + end_x) / 2, (start_y + end_y) / 2
            self.ax.text(mid_x + 0.2, mid_y + 0.2, '<<extend>>', 
                        fontsize=6, color=self.extend_color, style='italic')
    
    def draw_include_relations(self):
        """Dessine les relations include (pointillés avec flèche pleine)"""
        include_relations = [
            # S'authentifier <<include>> Valider token
            (5, 12, 5, 8),
            # Gérer profil <<include>> Vérifier permissions
            (9, 12, 9, 8),
            # Consulter cours <<include>> Logger activité
            (13, 12, 13, 8),
            # Gérer fichiers <<include>> Gérer MinIO
            (17, 12, 17, 8),
        ]
        
        for start_x, start_y, end_x, end_y in include_relations:
            self.ax.annotate('', xy=(end_x, end_y), xytext=(start_x, start_y),
                           arrowprops=dict(arrowstyle='->', color=self.include_color, 
                                         lw=1.5, linestyle='dotted'))
            # Ajouter le label <<include>>
            mid_x, mid_y = (start_x + end_x) / 2, (start_y + end_y) / 2
            self.ax.text(mid_x + 0.2, mid_y + 0.2, '<<include>>', 
                        fontsize=6, color=self.include_color, style='italic')
    
    def draw_associations(self):
        """Dessine les associations entre acteurs et cas d'utilisation principaux"""
        # Étudiant
        student_associations = [
            (1.3, 11, 5, 12),    # S'authentifier
            (1.3, 11, 9, 12),    # Gérer profil
            (1.3, 11, 13, 12),   # Consulter cours
            (1.3, 11, 17, 12),   # Gérer fichiers
        ]
        
        # Enseignant
        teacher_associations = [
            (1.3, 8, 5, 12),     # S'authentifier
            (1.3, 8, 9, 12),     # Gérer profil
            (1.3, 8, 13, 12),    # Consulter cours
            (1.3, 8, 17, 12),    # Gérer fichiers
        ]
        
        # Administrateur
        admin_associations = [
            (1.3, 5, 5, 12),     # S'authentifier
            (1.3, 5, 9, 12),     # Gérer profil
            (1.3, 5, 13, 12),    # Consulter cours (supervision)
            (1.3, 5, 17, 12),    # Gérer fichiers (supervision)
        ]
        
        # Dessiner toutes les associations
        all_associations = student_associations + teacher_associations + admin_associations
        
        for start_x, start_y, end_x, end_y in all_associations:
            self.ax.plot([start_x, end_x - 1.25], [start_y, end_y], 
                       'k-', linewidth=1, alpha=0.6)
    
    def add_legend(self):
        """Ajoute une légende détaillée"""
        legend_elements = [
            patches.Patch(color=self.actor_color, label='Acteurs'),
            patches.Patch(color='#E8F5E8', label='Cas d\'utilisation principaux'),
            patches.Patch(color='#FFF3E0', label='Extensions (<<extend>>)'),
            patches.Patch(color='#E3F2FD', label='Inclusions (<<include>>)'),
            plt.Line2D([0], [0], color='#795548', linewidth=2, label='Héritage'),
            plt.Line2D([0], [0], color=self.extend_color, linewidth=1.5, 
                      linestyle='dashed', label='Relation Extend'),
            plt.Line2D([0], [0], color=self.include_color, linewidth=1.5, 
                      linestyle='dotted', label='Relation Include'),
        ]
        self.ax.legend(handles=legend_elements, loc='upper right', fontsize=9, framealpha=0.9)
    
    def generate_diagram(self, filename='ent_est_sale_usecase_with_relations.png'):
        """Génère le diagramme complet avec toutes les relations"""
        self.draw_system_boundary()
        self.draw_actors()
        self.draw_use_cases()
        self.draw_inheritance_relations()
        self.draw_extend_relations()
        self.draw_include_relations()
        self.draw_associations()
        self.add_legend()
        
        plt.title('Diagramme de Cas d\'Utilisation avec Relations - ENT EST Salé', 
                 fontsize=20, fontweight='bold', pad=20)
        plt.tight_layout()
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Diagramme généré: {filename}")

def main():
    """Fonction principale"""
    print("🎓 Générateur de Diagramme de Cas d'Utilisation avec Relations - ENT EST Salé")
    print("=" * 80)
    
    generator = UseCaseDiagramWithRelations()
    
    print("📋 Acteurs avec héritage:")
    print("  • Utilisateur (acteur générique)")
    print("    ├── Étudiant (hérite)")
    print("    ├── Enseignant (hérite)")
    print("    └── Administrateur (hérite)")
    
    print("\n🔧 Cas d'utilisation principaux:")
    print("  • S'authentifier")
    print("  • Gérer profil")
    print("  • Consulter cours")
    print("  • Gérer fichiers")
    
    print("\n🔗 Relations:")
    print("  • <<extend>> : Extensions optionnelles")
    print("  • <<include>> : Inclusions obligatoires")
    print("  • ───► : Héritage entre acteurs")
    
    print("\n🎨 Génération du diagramme...")
    generator.generate_diagram()
    
    print("\n✅ Diagramme généré avec succès!")
    print("📁 Fichier sauvegardé: ent_est_sale_usecase_with_relations.png")

if __name__ == "__main__":
    main()
