class AddCantonToClients < ActiveRecord::Migration
  def change
    add_column :clients, :canton, :string, :limit => 2
  end
end