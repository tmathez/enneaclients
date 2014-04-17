class CreateCatalogues < ActiveRecord::Migration
  def self.up
    create_table :catalogues do |t|
      t.string :nom
      t.boolean :membre
      t.boolean :analyses
      t.float :prix
      
      t.timestamps
    end
  end

  def self.down
    drop_table :catalogues
  end
end
