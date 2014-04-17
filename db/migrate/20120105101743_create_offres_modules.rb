class CreateOffresModules < ActiveRecord::Migration
  def self.up
    create_table :offres_modules do |t|
      t.integer :offre_id
      t.integer :module_id
      t.string :nom
      t.string :description
      t.float :prix
      
      t.timestamps
    end
  end

  def self.down
    drop_table :offres_modules
  end
end
