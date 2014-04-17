class CreateEvenements < ActiveRecord::Migration
  def self.up
    create_table :evenements do |t|
      t.boolean :resolu
      t.text :description
      t.text :solution
      t.integer :concerne
      t.integer :responsable_id
      t.integer :client_id
      
      t.timestamps
    end
  end

  def self.down
    drop_table :evenements
  end
end
