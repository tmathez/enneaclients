class CreateSoftwareModules < ActiveRecord::Migration
  def self.up
    create_table :software_modules do |t|
      t.string :nom
      t.string :description
      t.float :prix
      
      t.timestamps
    end
  end

  def self.down
    drop_table :software_modules
  end
end
