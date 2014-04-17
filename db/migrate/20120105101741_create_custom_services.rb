class CreateCustomServices < ActiveRecord::Migration
  def self.up
    create_table :custom_services do |t|
      t.string :nom
      t.string :description
      t.float :prix_jour
      t.float :prix_heure
      
      t.timestamps
    end
  end

  def self.down
    drop_table :custom_services
  end
end
