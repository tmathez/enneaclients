class CreateMailingsClients < ActiveRecord::Migration
  def self.up
    create_table :mailings_clients do |t|
      t.integer :client_id
      t.integer :mailing_id
      
      t.timestamps
    end
  end

  def self.down
    drop_table :mailings_clients
  end
end
