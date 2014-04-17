class CreateEnvoisClients < ActiveRecord::Migration
  def self.up
    create_table :envois_clients do |t|
      t.integer :client_id
      t.integer :envoi_id
      
      t.timestamps
    end
  end

  def self.down
    drop_table :envois_clients
  end
end