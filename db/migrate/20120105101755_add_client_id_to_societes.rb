class AddClientIdToSocietes < ActiveRecord::Migration
  def self.up
    add_column :societes, :client_id, :string
  end

  def self.down
    remove_column :societes, :client_id
  end
end