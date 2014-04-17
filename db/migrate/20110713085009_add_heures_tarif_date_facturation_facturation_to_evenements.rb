class AddHeuresTarifDateFacturationFacturationToEvenements < ActiveRecord::Migration
  def self.up
    add_column :evenements, :heures, :float
    add_column :evenements, :tarif, :float
    add_column :evenements, :date_facturation, :date
    add_column :evenements, :facturation, :integer
  end

  def self.down
  	remove_column :evenements, :heures
    remove_column :evenements, :tarif
    remove_column :evenements, :date_facturation
    remove_column :evenements, :facturation
  end
end
