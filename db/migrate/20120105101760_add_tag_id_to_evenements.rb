class AddTagIdToEvenements < ActiveRecord::Migration
  def self.up
    add_column :evenements, :tag_id, :integer
  end

  def self.down
    remove_column :evenements, :tag_id
  end
end
