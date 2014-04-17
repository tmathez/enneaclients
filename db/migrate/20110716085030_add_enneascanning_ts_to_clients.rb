class AddEnneascanningTsToClients < ActiveRecord::Migration
  def self.up
    add_column :clients, :enneascanning_ts, :boolean
  end

  def self.down
    remove_column :clients, :enneascanning_ts
  end
end
