class AddInactifToClients < ActiveRecord::Migration
  def self.up
    add_column :clients, :inactif, :boolean
  end

  def self.down
    remove_column :clients, :inactif
  end
end
