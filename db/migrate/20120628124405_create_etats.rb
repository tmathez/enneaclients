class CreateEtats < ActiveRecord::Migration
  def self.up
    create_table :etats do |t|
      t.string :description
      
      t.timestamps
    end
  end

  def self.down
    drop_table :etats
  end
end