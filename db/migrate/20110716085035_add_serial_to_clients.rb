class AddSerialToClients < ActiveRecord::Migration
  def self.up
    add_column :clients, :serial, :string
  end

  def self.down
    remove_column :clients, :serial
  end
end