class AddFaxNatelToClients < ActiveRecord::Migration
  def change
    add_column :clients, :fax, :string
    add_column :clients, :natel, :string
  end
end
