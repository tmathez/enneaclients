class CreateClientsSecteurs < ActiveRecord::Migration
  def self.up
    create_table :clients_secteurs do |t|
      t.integer :client_id
      t.integer :secteur_id
      
      t.timestamps
    end
  end

  def self.down
    drop_table :clients_secteurs
  end
end
