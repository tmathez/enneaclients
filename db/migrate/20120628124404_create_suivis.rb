class CreateSuivis < ActiveRecord::Migration
  def self.up
    create_table :suivis do |t|
      t.integer :client_id
      t.integer :mailing_id
      t.integer :etat_id
      t.date :date_suivi
      t.string :contact_nom
      t.string :contact_prenom
      t.text :commentaire
      
      t.timestamps
    end
  end

  def self.down
    drop_table :suivis
  end
end