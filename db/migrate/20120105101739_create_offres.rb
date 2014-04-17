class CreateOffres < ActiveRecord::Migration
  def self.up
    create_table :offres do |t|
      t.integer :client_id
      t.string :client_nom
      t.string :client_adresse
      t.string :client_npa
      t.string :client_lieu
      t.string :texte_string
      t.string :texte_installation
      t.string :texte_final
      t.date :date_offre
      t.date :date_valide
      t.date :date_installation	
      t.integer :licences
      t.float :rabais_logiciel
      t.float :contrat
      t.float :tva
      t.boolean :accepte
   
      t.timestamps
    end
  end

  def self.down
    drop_table :offres
  end
end
