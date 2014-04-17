class AddNumeroEnneasoftAspClientVersionSorbaVersionEsorbaVersionEpdfToClients < ActiveRecord::Migration
  def self.up
    add_column :clients, :numero_enneasoft, :integer
    add_column :clients, :asp_client, :boolean
    add_column :clients, :version_sorba, :integer
    add_column :clients, :version_esorba, :integer
    add_column :clients, :version_epdf, :integer
  end

  def self.down
    remove_column :clients, :no_support
    remove_column :clients, :numero_enneasoft
    remove_column :clients, :asp_client
    remove_column :clients, :version_sorba
    remove_column :clients, :version_esorba
    remove_column :clients, :version_epdf
  end
end
