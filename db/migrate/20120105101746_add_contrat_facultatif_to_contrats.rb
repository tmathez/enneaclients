class AddContratFacultatifToContrats < ActiveRecord::Migration
  def self.up
    add_column :offres, :contrat_facultatif, :boolean
  end

  def self.down
    remove_column :offres, :contrat_facultatif
  end
end