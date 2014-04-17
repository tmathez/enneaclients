class CreateInterets < ActiveRecord::Migration
  def self.up
    create_table :interets do |t|
      t.integer :id
      t.string :description
      
      t.timestamps
    end
  end

  def self.down
    drop_table :interets
  end
end
