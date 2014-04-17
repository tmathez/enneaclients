class CreateTypeMailings < ActiveRecord::Migration
  def self.up
    create_table :type_mailings do |t|
      t.string :description
      
      t.timestamps
    end
  end

  def self.down
    drop_table :type_mailings
  end
end