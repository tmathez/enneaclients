class CreateSocietes < ActiveRecord::Migration
  def self.up
    create_table :societes do |t|
      t.string :nom
      
      t.timestamps
    end
  end

  def self.down
    drop_table :societes
  end
end