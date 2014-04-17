class AddNbLicencesTsToClients < ActiveRecord::Migration
  def self.up
    add_column :clients, :nb_licences_ts, :integer
  end

  def self.down
    remove_column :clients, :nb_licences_ts
  end
end