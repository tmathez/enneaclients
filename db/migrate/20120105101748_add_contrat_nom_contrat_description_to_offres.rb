class AddContratNomContratDescriptionToOffres < ActiveRecord::Migration
  def self.up
    add_column :offres, :contrat_nom, :string
    add_column :offres, :contrat_description, :text
  end

  def self.down
  	remove_column :offres, :contrat_nom
    remove_column :offres, :contrat_description
  end
end