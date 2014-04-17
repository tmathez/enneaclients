class AddInteresseNoContactToClients < ActiveRecord::Migration
  def change
    add_column :clients, :interesse, :boolean
    add_column :clients, :no_contact, :boolean
  end
end
