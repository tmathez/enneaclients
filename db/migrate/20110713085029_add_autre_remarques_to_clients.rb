class AddAutreRemarquesToClients < ActiveRecord::Migration
  def self.up
    add_column :clients, :autre, :text
    add_column :clients, :remarques, :text
  end

  def self.down
    remove_column :clients, :autre
    remove_column :clients, :remarques
  end
end
