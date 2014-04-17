class CreateOffresServices < ActiveRecord::Migration
  def self.up
    create_table :offres_services do |t|
      t.integer :offre_id
      t.integer :service_id
      t.string :description
      t.float :nb_jours
      t.float :nb_heures
      t.float :prix_jour
      t.float :prix_heure
      
      t.timestamps
    end
  end

  def self.down
    drop_table :offres_services
  end
end