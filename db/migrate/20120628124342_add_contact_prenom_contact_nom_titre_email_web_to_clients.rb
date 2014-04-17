class AddContactPrenomContactNomTitreEmailWebToClients < ActiveRecord::Migration
  def change
    add_column :clients, :contact_prenom, :string
    add_column :clients, :contact_nom, :string
    add_column :clients, :titre, :string
    add_column :clients, :email, :string
    add_column :clients, :web, :string
  end
end
