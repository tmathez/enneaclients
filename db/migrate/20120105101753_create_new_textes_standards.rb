class CreateNewTextesStandards < ActiveRecord::Migration
  def self.up
    create_table :textes_standards do |t|
      t.integer :societe_id
      t.string :texte_string
      t.string :texte_rabais
      t.text :texte_installation
      t.text :texte_final
      t.string :contrat_nom
      t.text :contrat_description
      
      t.timestamps
    end
  end

  def self.down
    drop_table :textes_standards
  end
end