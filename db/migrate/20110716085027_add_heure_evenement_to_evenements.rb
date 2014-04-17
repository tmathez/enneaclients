class AddHeureEvenementToEvenements < ActiveRecord::Migration
  def self.up
    add_column :evenements, :heure_evenement, :timestamp
  end

  def self.down
    remove_column :evenements, :heure_evenement
  end
end
