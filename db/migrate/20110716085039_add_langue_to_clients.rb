class AddLangueToClients < ActiveRecord::Migration
  def self.up
    add_column :clients, :langue, :string
  end

  def self.down
    remove_column :clients, :langue
  end
end