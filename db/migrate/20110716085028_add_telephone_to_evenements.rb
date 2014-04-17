class AddTelephoneToEvenements < ActiveRecord::Migration
  def self.up
    add_column :evenements, :telephone, :string
  end

  def self.down
    remove_column :evenements, :telephone
  end
end
