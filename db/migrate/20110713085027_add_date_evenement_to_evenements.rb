class AddDateEvenementToEvenements < ActiveRecord::Migration
  def self.up
    add_column :evenements, :date_evenement, :date
  end

  def self.down
    remove_column :evenements, :date_evenement
  end
end
