class AddClientReferenceToOffres < ActiveRecord::Migration
  def self.up
    add_column :offres, :client_reference, :string
  end

  def self.down
    remove_column :offres, :client_reference
  end
end