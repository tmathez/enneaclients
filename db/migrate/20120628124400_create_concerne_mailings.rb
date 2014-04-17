class CreateConcerneMailings < ActiveRecord::Migration
  def self.up
    create_table :concerne_mailings do |t|
      t.string :description
      
      t.timestamps
    end
  end

  def self.down
    drop_table :concerne_mailings
  end
end