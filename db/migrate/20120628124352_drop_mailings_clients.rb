class DropMailingsClients < ActiveRecord::Migration
  def self.up
    drop_table :mailings_clients
  end

  def self.down
    create_table :mailings_clients do |t|
      t.integer :client_id
      t.integer :mailing_id
      
      t.timestamps
    end
  end
end
