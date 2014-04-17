class AddSocieteIdToOffres < ActiveRecord::Migration
  def self.up
    add_column :offres, :societe_id, :integer
  end

  def self.down
    remove_column :offres, :societe_id
  end
end