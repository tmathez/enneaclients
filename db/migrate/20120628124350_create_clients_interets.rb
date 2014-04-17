class CreateClientsInterets < ActiveRecord::Migration
  def self.up
    create_table :clients_interets do |t|
      t.integer :client_id
      t.integer :interet_id
      
      t.timestamps
    end
  end

  def self.down
    drop_table :clients_interets
  end
end
