class DropTagging < ActiveRecord::Migration
  def self.up
    drop_table :tagging
  end

  def self.down
  	create_table :tagging do |t|
      t.integer :evenement_id
      t.integer :tag_id
      
      t.timestamps
	end
  end
end