class CreateTagging < ActiveRecord::Migration
  def self.up
    create_table :tagging do |t|
      t.integer :evenement_id
      t.integer :tag_id
      
      t.timestamps
    end
  end

  def self.down
    drop_table :tagging
  end
end