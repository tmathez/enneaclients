class AddNoSupportToClients < ActiveRecord::Migration
  def self.up
    add_column :clients, :no_support, :boolean
  end

  def self.down
    remove_column :clients, :no_support
  end
end
