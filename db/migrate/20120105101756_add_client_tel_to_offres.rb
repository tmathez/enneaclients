class AddClientTelToOffres < ActiveRecord::Migration
  def self.up
    add_column :offres, :client_tel, :string
  end

  def self.down
    remove_column :offres, :client_tel
  end
end